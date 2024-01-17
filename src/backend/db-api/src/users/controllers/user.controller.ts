import { Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors, Body } from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { ApiOperation, ApiTags, ApiBody } from "@nestjs/swagger";
import { ChatDto } from "../../chat/dto/chat.dto";
import { User } from "../models/user.model";
import { PublicUserDto } from "../dto/public-user.dto";
import { UserDto } from "../dto/user.dto";
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
@ApiTags("User General Data")
export class UsersController {
    constructor (private readonly usersService: UsersService) {}

    // Debug endpoint. Shall be removed
    @Get("/users")
    findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get("/connected")
    @ApiOperation({
        summary: "Get the connected users"
    })
    async getConnectedUsers(): Promise<PublicUserDto[]> {
        return this.usersService.getOnlineUsers()
        .then(users => users
            .map(u => new PublicUserDto(u)));
    }

    @Get(':idOrUsername/blocks')
    @ApiOperation({
        summary: "Get the blocked users by given user"
    })
    async getBlockedUsers(@Param('idOrUsername') idOrUsername:string): Promise<PublicUserDto[]> {
        return this.usersService.getBlockedUsers(idOrUsername)
            .then(users => users
                .map(u => new PublicUserDto(u)));
    }

    @Get(':idOrUsername/chats')
    @ApiOperation({
        summary: "Get the chat rooms where this user belongs"
    })
    async getUserChats(@Param('idOrUsername') idOrUsername:string): Promise<ChatDto[]> {
        return this.usersService.getUserChats(idOrUsername);
    }

    @Get('changeUsername/:idOrUsername/:newUsername')
    changeUsername(@Param('idOrUsername') idOrUsername : string, @Param('newUsername') newUsername : string) : void {
      this.usersService.changeUsername(idOrUsername, newUsername)
    }

    @Post(':fortyTwoLogin/sign-in')
    @ApiOperation({
        summary: "Get the user data associated to the given 42 Login and set this user as online"
    })
    async signIn(@Param('fortyTwoLogin') loginFt:string): Promise<UserDto> {
        return this.usersService.signIn(loginFt).then(u => new UserDto(u));
    }

    @Post(':idOrUsername/online')
    @ApiOperation({
        summary: "Change the user status to online"
    })
    markUserAsConnected(@Param('idOrUsername') idOrUsername:string): Promise<void> {
        return this.usersService.setOnlineStatus(idOrUsername, true);
    }

    @Post(':idOrUsername/offline')
    @ApiOperation({
        summary: "Change the user status to offline"
    })
    markUserAsDisconnected(@Param('idOrUsername') idOrUsername:string): Promise<void> {
        return this.usersService.setOnlineStatus(idOrUsername, false);
    }

    @Post('users/:idOrUsername/enable2FA')
    @ApiOperation({
        summary: "Enable the 2FA for a user"
    })
    async enableUser2FA(@Param('idOrUsername') idOrUsername:string): Promise<void> {
        return this.usersService.set2FA(idOrUsername, true);
    }

    @Post('users/:idOrUsername/disable2FA')
    @ApiOperation({
        summary: "Disable the 2FA for a user"
    })
    async disableUser2FA(@Param('idOrUsername') idOrUsername:string): Promise<void> {
        return this.usersService.set2FA(idOrUsername, false);
    }

    @Post(":idOrUsername/blocks/:blockedUser")
    @ApiOperation({
        summary: "The given user will block another user"
    })
    async blockUser(@Param('idOrUsername') blocker: string, @Param('blockedUser') blocked: string): Promise<void> {
        return this.usersService.blockUser(blocker, blocked);
    }

    @Delete(":idOrUsername/blocks/:blockedUser")
    @ApiOperation({
        summary: "The given user will unblock another user"
    })
    async unblockUser(@Param('idOrUsername') blocker: string, @Param('blockedUser') blocked: string): Promise<void> {
        return this.usersService.unblockUser(blocker, blocked);
    }

    @Get("/users/connect_status/:idOrUsername")
    async getConnectStatus(@Param('idOrUsername') user: string) : Promise<string> {
      return this.usersService.getConnectStatus(user)
    }

    @Post('users/:idOrUsername/uploadProfilePic')
    @UseInterceptors(FileInterceptor('image', {
      storage: diskStorage({
        destination: './src/profile_pics',
        filename: (req, file, callback) => {
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
            return callback(null, `${randomName}`);
        }
      })
    }))
    async uploadProfilePic(@UploadedFile() file, @Param('idOrUsername') userId : string) {
      console.log(file.path)
      this.usersService.setUserProfilePic(userId, file.path)
      return { imagePath: file.path }
    }

    @Delete('/:idOrUsername')
    delete(@Param('idOrUsername') user: string): Promise<void> {
        return this.usersService.remove(user);
    }
}
