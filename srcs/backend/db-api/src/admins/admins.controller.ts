import { BadRequestException, ForbiddenException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Logger, Req, NotFoundException } from "@nestjs/common";
import { AdminsService } from "./admins.service";
import { Admin } from "./admin.model";
import { UserDto } from "../users/dto/user.dto";
import { NewUser } from "../users/dto/new-user.dto";
import { ApiTags, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { BansService } from "../bans/bans.service";
import { PlayersService } from "../users/services/players.service";
import { PlayerBanStatusDto } from "../users/dto/player-banstatus.dto";
import { Chat } from "../chat/models/chat.model";
import { ChatDto } from "../chat/dto/chat.dto";
import { ChatService } from "../chat/services/chat.service";
import { ChatUserDto } from "../users/dto/chat-user.dto";
import { ChatWithUsernamesDto } from "../chat/dto/chat-usernames.dto";
import { PublicUserDto } from "../users/dto/public-user.dto";
import { MetaverseGateway } from "../meta/metaverse.gateway";
import { User } from "../users/models/user.model";
import { UsersService } from "../users/services/users.service";

@ApiBearerAuth()
@Controller('admins')
@ApiTags('Admins')
export class AdminsController {
    constructor (
        private readonly adminService : AdminsService,
        private readonly playerService: PlayersService,
        private readonly banService: BansService,
        private readonly chatService: ChatService,
        private readonly userService: UsersService,
        private readonly metaverseGateway: MetaverseGateway
    ) {}

    checkIfAffectsRequester(requester: User, userId: string): boolean {
        return isNaN(+userId)
        ? requester.userName == userId 
        :  requester.id == +userId ;
    }

    @Post()
    async create(@Body() newAdmin: NewUser): Promise<UserDto> {
        const admin: Admin = await this.adminService.create(newAdmin); 
        const adminDto = new UserDto(admin.user);
        return adminDto;
    }

    @Post(':idOrUsername')
    async riseToAdmin(@Param('idOrUsername') user: string): Promise<void> {
        try {
            await this.adminService.riseToAdmin(user);
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                error.errors.forEach((validationError) => {
                if (validationError.type == 'unique violation') {
                    throw new BadRequestException("User is already an admin");
                } else {
                    Logger.warn(`${validationError.type}: ${validationError.message}`);
                    throw new BadRequestException("There was an error");
                }
                });
            } else {
                Logger.warn('Error:', error);
                throw new BadRequestException("There was an error");
            }
        }
    }

    @Delete(':idOrUsername')
    async revokeAdminPrivileges(@Param('idOrUsername') user: string): Promise<void> {
        await this.adminService.revokeAdminPrivileges(user);
    }

    @Post(':adminId/ban/:idOrUsername')
    async banUser(@Req() request, @Param('idOrUsername') user: string): Promise<void> {
        if (this.checkIfAffectsRequester(request.requester_info.dataValues, user))
        {
            throw new ForbiddenException("You can't ban yourself");
        }

        const player = await this.playerService.playerExists(user);
        if (!player) {
            throw new BadRequestException("Player doesn't exist");
        }
        const isAdmin = this.adminService.isAdmin(player.id);
        if (isAdmin)
        {
            await this.adminService.revokeAdminPrivilegesPlayerInfo(player);
        }

        await this.banService.banUser(player);
        this.metaverseGateway.kickFromMetaverse(player.id + '');
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
    async getPlayers(@Req() request): Promise<PlayerBanStatusDto[]> {
        return this.playerService
            .findAllWithBanStatus(request.requester_info.dataValues.id)
            .then(players => players.map(p => new PlayerBanStatusDto(p)));
    }

    @Get()
    async findAll(): Promise<Admin []> {
        return this.adminService.findAll();
    }

    @Get('/getChatsAndMembers')
    async getChatsAndMembers(): Promise<ChatDto[]> {
        const chatsPromise: Promise<Chat[]> = this.chatService.findAllExceptFriendshipChats();
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
        if (!await this.chatService.findOne(id))
        {
            throw new NotFoundException('This chat does not exist');
        }
        const users = await this.chatService.getChatUsers(id);
        const bans = await this.chatService.getBansMembers(id, users);
        return users.map(u => new ChatUserDto(u, bans.find(b => b.userId == u.userId) !== undefined));
    }

    @Get('/getChatAdmins/:chatId')
    async getChatAdmins(@Param('chatId', ParseIntPipe) id: number): Promise<ChatUserDto[]> {
        if (!await this.chatService.findOne(id))
        {
            throw new NotFoundException('This chat does not exist');
        }
        return this.chatService.getAdmins(id)
            .then(users => users
                .map(u => new ChatUserDto(u, false)));
    }

    @Get('/getChatBans/:chatId')
    async getChatBans(@Param('chatId', ParseIntPipe) id: number): Promise<PublicUserDto[]> {
        if (!await this.chatService.findOne(id))
        {
            throw new NotFoundException('This chat does not exist');
        }
        return this.chatService.getBans(id)
            .then(users => users
                .map(u => new PublicUserDto(u.user)));
    }

    @Delete('/chatOptions/:chatId')
    async deleteChat(@Param('chatId', ParseIntPipe) id: number): Promise<void> {
        return this.chatService.removeById(id);
    }

    @Post('/chatOptions/:chatId/raiseToAdmin/:usernameOrId')
    async raiseUserToChatAdmin(@Param('chatId', ParseIntPipe) id: number, @Param('usernameOrId') user: string): Promise<void> {
        const chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new NotFoundException("Chat doesn't exist");
        }
        return this.chatService.raiseRevokeChatAdmin(chat, user, true);
    }

    @Post('/chatOptions/:chatId/revokeAdmin/:usernameOrId')
    async revokeUserFromChatAdmin(@Param('chatId', ParseIntPipe) id: number, @Param('usernameOrId') user: string): Promise<void> {
        const chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new NotFoundException("Chat doesn't exist");
        }
        await this.chatService.raiseRevokeChatAdmin(chat, user, false);
    }

    @Post('/chatOptions/:chatId/ban/:usernameOrId')
    @ApiBody({ type: 'number', required: true })
    async banUserFromChat(@Param('chatId', ParseIntPipe) id: number, @Param('usernameOrId') userId: string, @Body('time', ParseIntPipe) time: number): Promise<void> {
        const chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new NotFoundException("Chat doesn't exist");
        }

        const user = await this.userService.findOneLight(userId);
        if (!user) {
            throw new NotFoundException("User doesn't exit");
        }
        return this.chatService.banUser(chat, user, time);
    }

    @Post('/chatOptions/:chatId/unban/:usernameOrId')
    async unBanUserFromChat(@Param('chatId', ParseIntPipe) id: number, @Param('usernameOrId', ParseIntPipe) userId: string): Promise<void> {
        const chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new NotFoundException("Chat doesn't exist");
        }

        const user = await this.userService.findOneLight(userId);
        if (!user) {
            throw new NotFoundException("User doesn't exit");
        }
        return this.chatService.unBanUser(chat, user);
    }

    @Post('/chatOptions/:chatId/mute/:usernameOrId')
    async muteUserFromChat(@Param('chatId', ParseIntPipe) id: number, @Param('usernameOrId') userId: string): Promise<void> {
        const chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new NotFoundException("Chat doesn't exist");
        }

        const user = await this.userService.findOneLight(userId);
        if (!user) {
            throw new NotFoundException("User doesn't exit");
        }
        return this.chatService.changeMuteStatus(chat, user, true);
    }

    @Post('/chatOptions/:chatId/unmute/:usernameOrId')
    async unMuteUserFromChat(@Param('chatId', ParseIntPipe) id: number, @Param('usernameOrId') userId: string): Promise<void> {
        const chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new NotFoundException("Chat doesn't exist");
        }

        const user = await this.userService.findOneLight(userId);
        if (!user) {
            throw new NotFoundException("User doesn't exit");
        }
        return this.chatService.changeMuteStatus(chat, user, false);
    }

    @Post('/chatOptions/:chatId/kick/:usernameOrId')
    async kickUserFromChat(@Param('chatId', ParseIntPipe) id: number, @Param('usernameOrId') user: string): Promise<void> {
        const chat = await this.chatService.findOne(id);
        if (!chat) {
            throw new NotFoundException("Chat doesn't exist");
        }

        return this.chatService.leave(user, chat.id);
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