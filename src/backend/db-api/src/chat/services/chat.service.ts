import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chat } from '../models/chat.model';
import { ChatUsers } from '../../chat-user/models/chatUsers.model';
import { UsersService } from '../../users/services/users.service';
import { User } from '../../users/models/user.model';
import * as bcrypt from 'bcrypt';
import { ChatDto } from '../dto/chat.dto';
import { Friendship } from '../../users/models/friendship.model';
import { MessageService } from './message.service';
import { Message } from '../models/message.model';

@Injectable()
export class ChatService {

    constructor (
        @InjectModel(Chat)
        private chatModel: typeof Chat,
        @InjectModel(ChatUsers)
        private chatUserModel: typeof ChatUsers,
        private readonly userService: UsersService,
        private readonly messageService: MessageService
    ) {}

    hashPassword(password: string): string {
        const salt: string = bcrypt.genSaltSync();
        return bcrypt.hashSync(password, salt);
    }

    validatePassword(chat: Chat, inputPassword?: string) {
        if (chat.password
            && ((inputPassword && !bcrypt.compareSync(inputPassword, chat.password))
            || !inputPassword))
        {
            throw new ForbiddenException('Incorrect chat password');
        }
    }

    async create(creatorId: string, password?: string): Promise<ChatDto> {
        const creator: User = await this.userService.findOne(creatorId);
        if (!creator) {
            throw new BadRequestException('User doesn\'t exists');
        }

        const chat: Chat = await this.chatModel.create({
            password: (password ? this.hashPassword(password) : null)
        });
        const chatUser: ChatUsers = await this.chatUserModel.create({
            userId: creator.id,
            chatId: chat.id,
            isAdmin: true,
            isOwner: true,
            isBanned: false
        });

        chatUser.user = creator;
        return new ChatDto(chat, [chatUser]);
    }

    async createFriendshipChat(user: User, friend: User, friendship: Friendship): Promise<Chat> {
        return this.chatModel.create({
            isPrivateChat: true,
            friendshipId: friendship.id
        }).then(async chat => {
            await this.chatUserModel.bulkCreate([
                {
                    userId: user.id,
                    chatId: chat.id,
                },
                {
                    userId: friend.id,
                    chatId: chat.id
                }
            ]);
            return chat;
        });
    }

    deleteById(id: number): Promise<void> {
        return this.chatModel.destroy({
            where: {
                id: id
            }
        }).then(() => {});
    }

    findAll(): Promise<Chat[]> {
        return this.chatModel.findAll();
    }

    findAllWithUsernames(): Promise<Chat[]> {
        return this.chatModel.findAll({
            include: {
                model: User,
                attributes: ['id', 'userName']
            }
        })
    }

    findOne(id: number): Promise<Chat> {
        return this.chatModel.findByPk(id);
    }

    findOneWithUsers(id: number) {
        return this.chatModel.findByPk(id, {
            include: User
        });
    }

    async getChatUsers(id: number): Promise<ChatUsers[]> {
        return this.chatUserModel.findAll({
            where: {
                chatId: id
            },
            include: {
                model: User
            }
        });
    }

    async removeById(id: number): Promise<void> {
        const chat: Chat = await this.chatModel.findByPk(id, { attributes: ['id'] });
        if (chat  == null) {
            throw new BadRequestException('Chat doesn\'t exists');
        }

        this.chatModel.destroy({
            where: {
                id: id
            }
        });
    }

    async remove(chat: Chat): Promise<void> {
        this.chatModel.destroy({
            where: {
                id: chat.id
            }
        });
    }

    async join(user: string, chat: Chat): Promise<void> {
        const userId: number = await this.userService.userExists(user);
        if (!userId) {
            throw new BadRequestException('User doesn\'t exists');
        }

        if (chat.isPrivateChat) {
            throw new ForbiddenException('User can\'t join a private chat');
        }

        this.chatUserModel.create({
            userId: userId,
            chatId: chat.id,
            isAdmin: false
        });
    }

    async leave(user: string, id: number): Promise<void> {
        let promises: Promise<void>[] = [];

        const userId: number = await this.userService.userExists(user);
        if (!userId) {
            throw new BadRequestException('User doesn\'t exists');
        }

        const chat: Chat = await this.findOneWithUsers(id);
        if (!chat) {
            throw new BadRequestException('Chat doesn\'t exists');
        }
        
        if (chat.isPrivateChat) {
            throw new BadRequestException('User can\'t leave this chat');
        }

        const relation: ChatUsers = await this.chatUserModel.findOne({
            where: {
                chatId: chat.id,
                userId: userId
            }
        })
        if (!relation) {
            throw new BadRequestException('User doesn\'t belong to this chat');
        }

        if (chat.users.length == 1 || relation.isOwner) {
            promises.push(this.remove(chat));            
        }

        promises.push(relation.destroy());
        Promise.all(promises);
    }

    async isAdmin(user: string, chatId:number): Promise<boolean> {
        const userId: number = await this.userService.userExists(user);
        if (!userId) {
            throw new BadRequestException('Requester doesn\'t exists');
        }

        const userChatRelation: ChatUsers = await this.chatUserModel.findOne({
            where: {
                userId: userId,
                chatId: chatId,
            }
        });
        if (!userChatRelation)
        {
            throw new BadRequestException('Requester doesn\'t belong to chat');
        }

        return (userChatRelation.isAdmin && !userChatRelation.isBanned);
    }

    async changePrivileges(id: number, chatAdmin: string, user: string, admin: boolean): Promise<void> {
        const chat: Chat = await this.chatModel.findOne({
            attributes: ['id'],
            where: {
                id: id
            }
        });
        if (!chat) {
            throw new BadRequestException('Chat doesn\'t exists');
        }

        if (!await this.isAdmin(chatAdmin, id)) {
            throw new BadRequestException('Requester is not a chat administrator');
        }

        await this.raiseRevokeChatAdmin(chat, user, admin);
    }

    async raiseRevokeChatAdmin(chat: Chat, user: string, admin: boolean): Promise<void> {
        if (chat.isPrivateChat) {
            throw new BadRequestException('Private chat doesn\'t have administrators');
        }

        const userId: number = await this.userService.userExists(user);
        if (!userId) {
            throw new BadRequestException('User doesn\'t exists');
        }

        const userChatRelation: ChatUsers = await this.chatUserModel.findOne({
            where: {
                userId: userId,
                chatId: chat.id,
            }
        });
        if (!userChatRelation) {
            throw new ForbiddenException('User doesn\'t belong to chat');
        }
        else if (userChatRelation) {
            throw new ForbiddenException('You can\'t change the chat owner privileges');
        }

        userChatRelation.isAdmin = admin;
        userChatRelation.save();
    }

    async setBanOrMuteStatus(id: number, chatAdmin: string, user: string, status: boolean, ban: boolean): Promise<void> {
        const chat: Chat = await this.chatModel.findOne({
            attributes: ['id'],
            where: {
                id: id
            }
        });
        if (!chat) {
            throw new BadRequestException('Chat doesn\'t exists');
        }

        if (!await this.isAdmin(chatAdmin, id)) {
            throw new BadRequestException('Requester is not a chat administrator');
        }
        
        if (ban) {
            await this.changeBanOrMuteStatus(chat, user, status, ban);
        }
    }

    async changeBanOrMuteStatus(chat: Chat, user: string, status: boolean, ban: boolean)
    {
        const userId: number = await this.userService.userExists(user);
        if (!userId) {
            throw new BadRequestException('User doesn\'t exists');
        }

        const userChatRelation: ChatUsers = await this.chatUserModel.findOne({
            where: {
                userId: userId,
                chatId: chat.id,
            }
        });
        if (!userChatRelation) {
            throw new ForbiddenException('User doesn\'t belong to chat');
        }
        else if (userChatRelation.isOwner) {
            throw new BadRequestException('You can\'t ban the chat owner');
        }

        if (chat.isPrivateChat) {
            throw new BadRequestException('You can\'t ban or mute a user in a private chat');
        }

        if (ban) {
            userChatRelation.isBanned = status;
        } else {
            userChatRelation.isMuted = status;
        }

        if (userChatRelation.isAdmin && !status) {
            userChatRelation.isAdmin = false;
        }
        userChatRelation.save();
    }

    async getAdmins(id: number): Promise<ChatUsers[]> {
        return this.chatUserModel.findAll({
            where: {
                chatId: id,
                isAdmin: true
            },
            include: {
                model: User
            }
        });
    }

    async getBans(id: number): Promise<ChatUsers[]> {
        return this.chatUserModel.findAll({
            where: {
                chatId: id,
                isBanned: true
            },
            include: {
                model: User
            }
        });
    }

    async setPassword(id: number, password: string): Promise<void> {
        const chat: Chat = await this.chatModel.findOne({
            attributes: ['id'],
            where: {
                id: id
            }
        });
        if (!chat) {
            throw new BadRequestException('Chat doesn\'t exists');
        }

        if (chat.isPrivateChat) {
            throw new BadRequestException('Private chat doesn\'t have password');
        }

        chat.password = this.hashPassword(password);
        chat.save();
    }

    async unsetPassword(chat: Chat, password: string): Promise<void> {
        chat.password = null;
        chat.save();
    }

    async getNewMessages(userId: string, chatId: number, password?: string): Promise<Message[]> {
        const user = await this.userService.userExists(userId);
        if (!user)
        {
            throw new BadRequestException('User doesn\'t exist');
        }
        const chatRelation = await this.chatUserModel.findOne({
            where: {
                userId: user,
                chatId: chatId
            },
            include: Chat
        });
        if (!chatRelation)
        {
            throw new BadRequestException('User doesn\'t belong to that chat');
        }

        this.validatePassword(chatRelation.chat, password);
        const messagesPromise = this.messageService.getMessages(chatRelation);
        chatRelation.lastMsgReadDate = new Date();
        await chatRelation.save();
        return messagesPromise;
    }
}