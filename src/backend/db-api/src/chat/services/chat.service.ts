import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Chat } from '../models/chat.model';
import { ChatUsers } from '../../chat-user/models/chatUsers.model';
import { UsersService } from '../../users/services/users.service';
import { User } from '../../users/models/user.model';
import * as bcrypt from 'bcrypt';
import { ChatDto } from '../dto/chat.dto';
import { Friendship } from '../../users/models/friendship.model';
import { MessageService } from './message.service';
import { Message } from '../models/message.model';
import { ChatBans } from '../../chat-user/models/chatBan.model';

@Injectable()
export class ChatService {

    constructor (
        @InjectModel(Chat)
        private chatModel: typeof Chat,
        @InjectModel(ChatUsers)
        private chatUserModel: typeof ChatUsers,
        @InjectModel(ChatBans)
        private chatBansModel: typeof ChatBans,
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

        const necklaceSpend: boolean = await this.userService.subtractNecklaceFromUser(creator, 1);

        if (!necklaceSpend) {
            throw new ForbiddenException('Not enought necklaces');
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
        return new ChatDto(chat, [chatUser], []);
    }

    async createWithUser(creator: User, password?: string): Promise<Chat> {
        const chat: Chat = await this.chatModel.create({
            password: (password ? this.hashPassword(password) : null)
        });

        await this.chatUserModel.create({
            userId: creator.id,
            chatId: chat.id,
            isAdmin: true,
            isOwner: true,
            isBanned: false
        });

        return chat;
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

    async join(userId: string, chat: Chat): Promise<ChatUsers> {
        const user: User = await this.userService.findOne(userId);
        let locked = false;

        if (!user) {
            throw new BadRequestException('User doesn\'t exists');
        }
        
        if (await this.isBannedId(chat.id, user.id)) {
            throw new ForbiddenException('User is banned from this chat');
        }

        if (chat.isPrivateChat) {
            throw new ForbiddenException('User can\'t join a private chat');
        }

        if (chat.password) {
            locked = true;
        }

        let chatUserRelation = await this.chatUserModel.create({
            userId: user.id,
            chatId: chat.id,
            isAdmin: false,
            chatLocked: locked,
        });

        chatUserRelation.user = user;
        return chatUserRelation;
    }

    async changeLockStatus(user: string, chat: Chat, lock: boolean): Promise<ChatUsers> {
        const userId: number = await this.userService.userExists(user);

        if (!userId) {
            throw new BadRequestException('User doesn\'t exists');
        }

        if (chat.isPrivateChat) {
            throw new ForbiddenException('User can\'t join a private chat');
        }

        if (!chat.password) {
            throw new BadRequestException('Chat doesn\'t have a password');
        }

        const userChatRelation: ChatUsers = await this.chatUserModel.findOne({
            where: {
                userId: userId,
                chatId: chat.id
            }
        });

        if (!userChatRelation) {
            throw new ForbiddenException('User don\'t belong to chat');
        }

        userChatRelation.chatLocked = lock;
        return userChatRelation.save();
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
            },
        });
        if (!userChatRelation)
        {
            throw new BadRequestException('Requester doesn\'t belong to chat');
        }

        return (userChatRelation.isAdmin && !(await this.isBannedId(userChatRelation.chatId, userChatRelation.userId)));
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
        userChatRelation.chatLocked = !admin;
        userChatRelation.save();
    }

    async setMuteStatus(id: number, chatAdmin: string, user: string, status: boolean): Promise<void> {
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

        await this.changeMuteStatus(chat, user, status);
    }

    async chatAdminBanUser(id: number, chatAdmin: string, user: string, minutes: number): Promise<void> {
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
        this.banUser(chat, user, minutes);
    }

    async chatAdminUnbanUser(id: number, chatAdmin: string, user: string): Promise<void> {
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
        this.unBanUser(chat, user);
    }

    async changeMuteStatus(chat: Chat, user: string, status: boolean)
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
            throw new BadRequestException('You can\'t mute the chat owner');
        }

        if (chat.isPrivateChat) {
            throw new BadRequestException('You can\'t mute a user in a private chat');
        }

        if (userChatRelation.isAdmin && !status) {
            userChatRelation.isAdmin = false;
        }
        userChatRelation.isMuted = status;
        userChatRelation.save();
    }

    async banUser(chat: Chat, user: string, minutes: number)
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

        if (userChatRelation && userChatRelation.isOwner) {
            throw new BadRequestException('You can\'t ban the chat owner');
        }

        if (chat.isPrivateChat) {
            throw new BadRequestException('You can\'t mute a user in a private chat');
        }

        if (userChatRelation && userChatRelation.isAdmin) {
            userChatRelation.isAdmin = false;
        }

        const ban = await this.chatBansModel.findOne({
            where: {
                chatId: chat.id,
                userId: userId
            }
        })

        let banEnd = new Date(new Date().getTime() + minutes * 60000);

        if (ban) {
            ban.endDate = banEnd;
            await ban.save();
        }
        else {
            this.chatBansModel.create({
                chatId: chat.id,
                userId: userId,
                endDate: banEnd
            });
        }
    }

    async unBanUser(chat: Chat, user: string)
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

        if (chat.isPrivateChat) {
            throw new BadRequestException('You can\'t mute a user in a private chat');
        }

        this.chatBansModel.destroy({
            where: {
                chatId: chat.id,
                userId: userId,
            }
        });
    }

    async isBanned(chat: Chat, user: string): Promise<boolean> {
        const now = new Date();
        const userId: number = await this.userService.userExists(user);
        if (!userId) {
            throw new BadRequestException('User doesn\'t exists');
        }

        const ban = await this.chatBansModel.findOne({
            where: {
                chatId: chat.id,
                userId: userId
            }
        });
        return (ban && ban.endDate > now);
    }

    async isBannedId(chatId: number, userId: number): Promise<boolean>
    {
        const now = new Date();

        const ban = await this.chatBansModel.findOne({
            where: {
                chatId: chatId,
                userId: userId
            }
        });
        return (ban && ban.endDate > now);
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

    async getBans(id: number): Promise<ChatBans[]> {
        return this.chatBansModel.findAll({
            where: {
                chatId: id,
                endDate: {
                    [Op.gte]: new Date()
                }
            },
            include: {
                model: User
            },
        });
    }

    async getBansMembers(id: number, users: ChatUsers[]): Promise<ChatBans[]> {
        const userIds = users.map(u => u.userId);
        return this.chatBansModel.findAll({
            where: {
                chatId: id,
                userId: userIds,
                endDate: {
                    [Op.gte]: new Date()
                }
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
            throw new BadRequestException('Private chat can\'t have password');
        }

        chat.password = this.hashPassword(password);
        await chat.save();
        
        await this.chatUserModel.update({ chatLocked: true }, {
            where: {
                chatId: chat.id,
                isAdmin: false,
                isOwner: false,
            }
        });
    }

    async unsetPassword(chat: Chat, password: string): Promise<void> {
        chat.password = null;
        await chat.save();
        await this.chatUserModel.update({ chatLocked: false }, { where: { chatId: chat.id } });
    }

    async getNewMessages(userId: string, chatId: number): Promise<Message[]> {
        const user = await this.userService.userExists(userId);
        if (!user)
        {
            throw new BadRequestException('User doesn\'t exist');
        }

        if (await this.isBannedId(chatId, user)) {
            throw new ForbiddenException('User is banned from this chat');
        }

        const chatRelation = await this.chatUserModel.findOne({
            where: {
                userId: user,
                chatId: chatId
            }
        });

        if (!chatRelation)
        {
            throw new BadRequestException('User doesn\'t belong to that chat');
        }

        if (chatRelation.chatLocked) {
            throw new BadRequestException('Chat is locked for this user. Unlock it to be able to read messages');
        }

        const messagesPromise = this.messageService.getMessages(chatRelation);
        chatRelation.lastMsgReadDate = new Date();
        await chatRelation.save();
        return messagesPromise;
    }

    async sendMessageToChat(userId: string, chat: Chat, message: string): Promise<void> {
        const user = await this.userService.findOneLight(userId);
        if (!user)
        {
            throw new BadRequestException('User doesn\'t exist');
        }

        if (await this.isBannedId(chat.id, user.id)) {
            throw new ForbiddenException('User is banned from this chat');
        }

        const chatRelation = await this.chatUserModel.findOne({
            where: {
                userId: user.id,
                chatId: chat.id
            },
        });

        if (!chatRelation)
        {
            throw new BadRequestException('User doesn\'t belong to that chat');
        }

        if (chatRelation.chatLocked) {
            throw new BadRequestException('Chat is locked for this user. Unlock it to be able to send messages.');
        }

        return this.messageService.sendMessage(user, chat, message);
    }
}