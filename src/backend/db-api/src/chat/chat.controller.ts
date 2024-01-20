import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatDto } from './dto/chat.dto';
import { Chat } from './models/chat.model';
import { ChatUserDto } from '../users/dto/chat-user.dto';
import { MessageService } from './services/message.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Message } from './models/message.model';
import { PublicUserDto } from '../users/dto/public-user.dto';

@Controller('chats')
@ApiTags("Chats")
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly messageService: MessageService
        ) {}

    // Debug endpoint. Shall be removed
    @Get()
    findAll(): Promise<Chat[]> {
        return this.chatService.findAll();
    }

    @Get(':chatId/getMessages/:idOrUsername')
    @ApiOperation({
        summary: 'Get messages new messages in this chat',
        description: 'This endpoint will send you a list of messasges of a user that belong to this chat.'
    })
    getChatMessages(@Param('idOrUsername') user: string, @Param('chatId') chatId: number): Promise<Message[]> {
        return this.chatService.getNewMessages(user, chatId);
    }

    // TODO: Use authentication to check if the user that tries to get this info can see it.
    @Get(':id/users')
    @ApiOperation({
        summary: 'Get users in this chat',
        description: 'This endpoint will send you a list of users that belong to this chat.'
    })
    async getChatUsers(@Param('id', ParseIntPipe) id: number): Promise<ChatUserDto[]> {
        const chat: Chat = await this.chatService.findOne(id);
        if (chat  == null) {
            throw new BadRequestException('Chat doesn\'t exists');
        }
        if (chat.password || chat.isPrivateChat) {
            throw new ForbiddenException('Can see the members of this chat unless you belong to it');
        }
        const users = await this.chatService.getChatUsers(id).then();
        const bans = await this.chatService.getBansMembers(id, users);
        return users.map(u => new ChatUserDto(u, bans.find(b => b.userId == u.userId) !== undefined));
    }

    // TODO: Should be available only if the chat is not locked to you
    @Post(':id/admins')
    @ApiOperation({
        summary: 'Get the administators of this chat',
        description: 'This endpoint will send you a list of users that moderate this chat. Password may be required.'
    })
    async getAdmins(@Param('id', ParseIntPipe) id: number): Promise<ChatUserDto[]> {
        const chat: Chat = await this.chatService.findOne(id);
        if (chat  == null) {
            throw new BadRequestException('Chat doesn\'t exists');
        }

        if (chat.password || chat.isPrivateChat) {
            throw new ForbiddenException('Can see the members of this chat unless you belong to it');
        }
        return this.chatService.getAdmins(+id).then(users => users.map(u => new ChatUserDto(u, false)));
    }

    // TODO: Should be available only if the chat is not locked to you
    @Post(':id/bans')
    @ApiBody({required: false, type: CreateChatDto})
    @ApiOperation({
        summary: 'Get the banned users of this chat',
        description: 'This endpoint will send you a list of users are banned in this chat.'
    })
    async getBanned(@Param('id', ParseIntPipe) id: number): Promise<PublicUserDto[]> {
        const chat: Chat = await this.chatService.findOne(id);
        if (chat  == null) {
            throw new BadRequestException('Chat doesn\'t exists');
        }
        return this.chatService.getBans(+id).then(users => users.map(u => new PublicUserDto(u.user)));
    }

    @Post('new/:user')
    @ApiBody({required: false, type: CreateChatDto})
    @ApiOperation({
        summary: 'Create a new chat room',
        description: 'This endpoint creates a chat room and adds the creator user to it and makes this user a administrator of it. A password can be assigned.'
    })
    create(@Param('user') creator: string, @Body() createChatDto?: CreateChatDto): Promise<ChatDto> {
        return this.chatService.create(creator, createChatDto?.password);
    }

    @Post(':id/join/:user')
    @ApiOperation({
        summary: 'Add a user to a chat room',
        description: 'This endpoint will add a user to the indicated chat room by its id.'
    })
    async joinChat(@Param('user') user: string, @Param('id') id: number): Promise<ChatUserDto> {
        const chat: Chat = await this.chatService.findOne(id);
        if (!chat)
        {
            throw new BadRequestException('Chat doesn\'t exists');
        }

        return this.chatService.join(user, chat).then(chatUser => new ChatUserDto(chatUser, false));
    }

    @Post(':id/setPassword')
    @ApiBody({type: CreateChatDto})
    @ApiOperation({
        summary: 'Assign a password to a chat room',
        description: 'This endpoint will assign a password to a existent chat room.'
    })
    setPassword(@Param('id', ParseIntPipe) id: number, @Body() createChatDto: CreateChatDto): Promise<void> {
        return this.chatService.setPassword(id, createChatDto.password);
    }
    
    @Post(':id/unsetPassword')
    @ApiBody({type: CreateChatDto})
    @ApiOperation({
        summary: 'Erase the password of a chat room',
        description: 'This endpoint will remove the password of a existent chat room. Password will be needed for this operation.'
    })
    async unsetPassword(@Param('id', ParseIntPipe) id: number, @Body() createChatDto: CreateChatDto): Promise<void> {
        const chat: Chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new BadRequestException('Chat doesn\'t exists');
        }

        this.chatService.validatePassword(chat, createChatDto.password);
        return this.chatService.unsetPassword(chat, createChatDto.password);
    }

    @Post(':id/sendMessage/:idOrUsername')
    @ApiBody({ description: 'message', required: true, type: SendMessageDto })
    async sendMessage(@Param('id', ParseIntPipe) id: number, @Param('idOrUsername') user: string, @Body() message: SendMessageDto): Promise<void> {
        const chat: Chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new BadRequestException('Chat doesn\'t exists');
        }

        return this.chatService.sendMessageToChat(user, chat, message.message);
    }
    
    @Post(':id/admins/:admin/riseToAdmin/:user')
    @ApiBody({required: false, type: CreateChatDto})
    @ApiOperation({
        summary: 'Rise user role to admin',
        description: 'This endpoint will transform a normal user to a moderator of this chat. \
This only can be done by an operator'
    })
    riseToAdmin(@Param('id', ParseIntPipe) id: number, @Param('admin') admin: string, @Param('user') user: string): Promise<void> {
        return this.chatService.changePrivileges(id, admin, user, true);
    }

    @Post(':id/admins/:admin/revokeAdmin/:user')
    @ApiBody({required: false, type: CreateChatDto})
    @ApiOperation({
        summary: 'Rise user role to admin',
        description: 'This endpoint will transform a normal user to a moderator of this chat. \
This only can be done by an operator'
    })
    revokeAdmin(@Param('id', ParseIntPipe) id: number, @Param('admin') admin: string, @Param('user') user: string): Promise<void> {
        return this.chatService.changePrivileges(id, admin, user, false);
    }

    @Post(':id/admins/:admin/ban/:user')
    @ApiBody({required: false, type: 'number'})
    @ApiOperation({
        summary: 'Ban a user of a chat',
        description: 'This endpoint will ban any user of a chat. If the user was an Admin that privileges will be revoked.'
    })
    async banUser(@Param('id', ParseIntPipe) id: number, @Param('admin') admin: string, @Param('user') user: string, @Body('time', ParseIntPipe) time: number): Promise<void> {
        return this.chatService.chatAdminBanUser(id, admin, user, time);
    }

    @Post(':id/admins/:admin/unban/:user')
    @ApiOperation({
        summary: 'Unban a user of a chat',
        description: 'This endpoint will unban a user of a chat.'
    })
    unBanUser(@Param('id', ParseIntPipe) id: number, @Param('admin') admin: string, @Param('user') user: string): Promise<void> {
        return this.chatService.chatAdminUnbanUser(id, admin, user);
    }

    @Post(':id/admins/:admin/mute/:user')
    @ApiBody({required: false, type: CreateChatDto})
    @ApiOperation({
        summary: 'Mute a user of a chat',
        description: 'This endpoint will mute any user of a chat. If the user was an Admin that privileges will be revoked.'
    })
    muteUser(@Param('id', ParseIntPipe) id: number, @Param('admin') admin: string, @Param('user') user: string): Promise<void> {
        return this.chatService.setMuteStatus(id, admin, user, true);
    }

    @Post(':id/admins/:admin/unmute/:user')
    @ApiBody({required: false, type: CreateChatDto})
    @ApiOperation({
        summary: 'Unmute a user of a chat',
        description: 'This endpoint will unmute a user of a chat.'
    })
    unMuteUser(@Param('id', ParseIntPipe) id: number, @Param('admin') admin: string, @Param('user') user: string): Promise<void> {
        return this.chatService.setMuteStatus(id, admin, user, false);
    }
    
    // TODO: Check if requestes can do this
    @Delete(':id')
    @ApiBody({required: false, type: CreateChatDto})
    @ApiOperation({
        summary: 'Delete a chat room',
        description: 'This endpoint will delete a chat room. This operation may require a password.'
    })
    async remove(@Param('id', ParseIntPipe) id: number, @Body() createChatDto?: CreateChatDto): Promise<void> {
        const chat: Chat = await this.chatService.findOne(id);
        if (chat  == null) {
            throw new BadRequestException('Chat doesn\'t exists');
        }

        this.chatService.validatePassword(chat, createChatDto?.password)
        return this.chatService.remove(chat);
    }


    // TODO: Check who is the person that is kicking.
    // If it themself should be allowed, but if it isn't there should be a check
    // if the kicker is an admin or if the kicked is the chat owner.
    @Delete(':user/:id')
    @ApiOperation({
        summary: 'Kick a user from chat room',
        description: 'This endpoint will kick user from a chat room.'
    })
    leaveChat(@Param('user') user: string, @Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.chatService.leave(user, id);
    }    
}
