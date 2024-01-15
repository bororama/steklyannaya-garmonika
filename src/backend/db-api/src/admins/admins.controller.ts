import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Post, ValidationPipe } from "@nestjs/common";
import { AdminsService } from "./admins.service";
import { Admin } from "./admin.model";
import { UserDto } from "../users/dto/user.dto";
import { NewUser } from "../users/dto/new-user.dto";
import { ApiTags } from "@nestjs/swagger";
import { BansService } from "../bans/bans.service";
import { PlayersService } from "../users/services/players.service";
import { PlayerBanStatusDto } from "../users/dto/player-banstatus.dto";
import { Chat } from "../chat/models/chat.model";
import { ChatDto } from "../chat/dto/chat.dto";
import { ChatService } from "../chat/services/chat.service";
import { ChatUserDto } from "../users/dto/chat-user.dto";
import { ChatWithUsernamesDto } from "../chat/dto/chat-usernames.dto";

@Controller('admins')
@ApiTags('Admins')
export class AdminsController {
    constructor (
        private readonly adminService : AdminsService,
        private readonly playerService: PlayersService,
        private readonly banService: BansService,
        private readonly chatService: ChatService
    ) {}

    @Post()
    async create(@Body() newAdmin: NewUser): Promise<UserDto> {
        const admin: Admin = await this.adminService.create(newAdmin); 
        const adminDto = new UserDto(admin.user);

        return adminDto;
    }

    @Post(':idOrUsername')
    async riseToAdmin(@Param('idOrUsername') user: string): Promise<void> {
        await this.adminService.riseToAdmin(user);
    }

    @Delete(':idOrUsername')
    async revokeAdminPrivileges(@Param('idOrUsername') user: string): Promise<void> {
        await this.adminService.revokeAdminPrivileges(user);
    }

    @Post(':adminId/ban/:idOrUsername')
    async banUser(@Param('idOrUsername') user: string, @Param('adminId', ParseIntPipe)banner: number): Promise<void> {
        const player = await this.playerService.playerExists(user);
        if (!player) {
            throw new BadRequestException("Player doesn't exist");
        }

        const admin = await this.adminService.findOne(banner);
        if (!admin) {
            throw new BadRequestException("Admin doesn't exist");
        }

        await this.banService.banUser(player, admin);
    }

    @Post('unban/:idOrUsername')
    async unbanUser(@Param('idOrUsername') user: string): Promise<void> {
        const player = await this.playerService.playerExists(user);
        if (!player) {
            throw new BadRequestException("Player doesn't exist");
        }

        this.banService.unBanUser(player);
    }

    @Get('players')
    async getPlayers(): Promise<PlayerBanStatusDto[]> {
        return this.playerService.findAllWithBanStatus().then(players => players.map(p => new PlayerBanStatusDto(p)));
    }

    @Get()
    async findAll(): Promise<Admin []> {
        return this.adminService.findAll();
    }

    @Get('/getChatsAndMembers')
    async getChatsAndMembers(): Promise<ChatDto[]> {
        const chatsPromise: Promise<Chat[]> = this.chatService.findAll();
        return chatsPromise
            .then(async chats => await Promise.all(chats
                .map(chat => this.chatService.getChatUsers(chat.id)
                    .then(users => new ChatDto(chat, users)))));
    }

    @Get('/getChats')
    async getChats(): Promise<ChatWithUsernamesDto[]> {
        return this.chatService.findAllWithUsernames().then(chats => chats.map(chat => new ChatWithUsernamesDto(chat)));
    }

    @Get('/getChatMembers/:chatId')
    async getChatMembers(@Param('chatId', ParseIntPipe) id: number): Promise<ChatUserDto[]> {
        return this.chatService.getChatUsers(id)
            .then(users => users
                .map(u => new ChatUserDto(u)));
    }

    @Get('/getChatAdmins/:chatId')
    async getChatAdmins(@Param('chatId', ParseIntPipe) id: number): Promise<ChatUserDto[]> {
        return this.chatService.getAdmins(id)
            .then(users => users
                .map(u => new ChatUserDto(u)));
    }

    @Get('/getChatBans/:chatId')
    async getChatBans(@Param('chatId', ParseIntPipe) id: number): Promise<ChatUserDto[]> {
        return this.chatService.getBans(id)
            .then(users => users
                .map(u => new ChatUserDto(u)));
    }

    @Post('/chatOptions/:chatId/raiseToAdmin/:usernameOrId')
    async raiseUserToChatAdmin(@Param('chatId', ParseIntPipe) id: number, @Param('usernameOrId') user: string): Promise<void> {
        const chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new BadRequestException("Chat doesn't exist");
        }
        await this.chatService.raiseRevokeChatAdmin(chat, user, true);
    }

    @Post('/chatOptions/:chatId/revokeAdmin/:usernameOrId')
    async revokeUserFromChatAdmin(@Param('chatId', ParseIntPipe) id: number, @Param('usernameOrId') user: string): Promise<void> {
        const chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new BadRequestException("Chat doesn't exist");
        }
        await this.chatService.raiseRevokeChatAdmin(chat, user, false);
    }

    @Post('/chatOptions/:chatId/ban/:usernameOrId')
    async banUserFromChat(@Param('chatId', ParseIntPipe) id: number, @Param('usernameOrId') user: string): Promise<void> {
        const chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new BadRequestException("Chat doesn't exist");
        }
        await this.chatService.changeBanOrMuteStatus(chat, user, true, true);
    }

    @Post('/chatOptions/:chatId/unban/:usernameOrId')
    async unBanUserFromChat(@Param('chatId', ParseIntPipe) id: number, @Param('usernameOrId') user: string): Promise<void> {
        const chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new BadRequestException("Chat doesn't exist");
        }
        await this.chatService.changeBanOrMuteStatus(chat, user, false, true);
    }

    @Post('/chatOptions/:chatId/mute/:usernameOrId')
    async muteUserFromChat(@Param('chatId', ParseIntPipe) id: number, @Param('usernameOrId') user: string): Promise<void> {
        const chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new BadRequestException("Chat doesn't exist");
        }
        await this.chatService.changeBanOrMuteStatus(chat, user, true, false);
    }

    @Post('/chatOptions/:chatId/unmute/:usernameOrId')
    async unMuteUserFromChat(@Param('chatId', ParseIntPipe) id: number, @Param('usernameOrId') user: string): Promise<void> {
        const chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new BadRequestException("Chat doesn't exist");
        }
        await this.chatService.changeBanOrMuteStatus(chat, user, false, false);
    }

    // This must be the last function declared in the controller.
    // Otherwise the other Get functions won't work lmao.
    @Get('/:id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
        const admin: Admin = await this.adminService.findOne(id);
        if (!admin) {
            throw new BadRequestException("Admin doesn't exist")
        }
        const adminDto = new UserDto(admin.user);

        return adminDto;
    }

}