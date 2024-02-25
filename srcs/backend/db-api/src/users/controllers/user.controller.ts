import { Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors, Req, UnauthorizedException, Logger, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { ApiOperation, ApiTags, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { ChatDto } from "../../chat/dto/chat.dto";
import { User } from "../models/user.model";
import { PublicUserDto } from "../dto/public-user.dto";
import { UserDto } from "../dto/user.dto";
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@Controller()
@ApiTags("User General Data")
export class UsersController {
    constructor (private readonly usersService: UsersService) {}

    checkIfAuthorized(requester: User, userId: string) {
        return isNaN(+userId)
        ? requester.userName == userId 
        :  requester.id == +userId ;
    }

    @Get("/users")
    findAll(@Req() request): Promise<User[]> {
        return this.usersService.findAllExcludingRequester(request.requester_info.dataValues.id);
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
    async getBlockedUsers(@Req() request, @Param('idOrUsername') idOrUsername:string): Promise<PublicUserDto[]> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, idOrUsername)) {
            throw new UnauthorizedException("Private information");
        }
        return this.usersService.getBlockedUsers(idOrUsername)
            .then(users => users
                .map(u => new PublicUserDto(u)));
    }

    @Get(':idOrUsername/chats')
    @ApiOperation({
        summary: "Get the chat rooms where this user belongs"
    })
    async getUserChats(@Req() request, @Param('idOrUsername') idOrUsername:string): Promise<ChatDto[]> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, idOrUsername)) {
            throw new UnauthorizedException("Private information");
        }
        return this.usersService.getUserChats(idOrUsername);
    }

    @Post('changeUsername/:idOrUsername/:newUsername')
    changeUsername(@Req() request, @Param('idOrUsername') idOrUsername : string, @Param('newUsername') newUsername : string) : Promise<void> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, idOrUsername)) {
            throw new UnauthorizedException("Private information");
        }
        return this.usersService.changeUsername(idOrUsername, newUsername)
    }

    @Post(':fortyTwoLogin/sign-in')
    @ApiOperation({
        summary: "Get the user data associated to the given 42 Login and set this user as online"
    })
    async signIn(@Req() request, @Param('fortyTwoLogin') loginFt:string): Promise<UserDto> {
        if (request.requester_info.dataValues.loginFT != loginFt) {
            throw new UnauthorizedException("Private information");
        }
        return this.usersService.signIn(loginFt).then(u => new UserDto(u));
    }

    @Post(':idOrUsername/online')
    @ApiOperation({
        summary: "Change the user status to online"
    })
    markUserAsConnected(@Req() request, @Param('idOrUsername') idOrUsername:string): Promise<void> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, idOrUsername)) {
            throw new UnauthorizedException("Private information");
        }
        return this.usersService.setOnlineStatus(idOrUsername, true);
    }

    @Post(':idOrUsername/offline')
    @ApiOperation({
        summary: "Change the user status to offline"
    })
    markUserAsDisconnected(@Req() request, @Param('idOrUsername') idOrUsername:string): Promise<void> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, idOrUsername)) {
            throw new UnauthorizedException("Private information");
        }
        return this.usersService.setOnlineStatus(idOrUsername, false);
    }

    @Post('users/:idOrUsername/enable2FA')
    @ApiOperation({
        summary: "Enable the 2FA for a user"
    })
    async enableUser2FA(@Req() request, @Param('idOrUsername') idOrUsername:string): Promise<void> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, idOrUsername)) {
            throw new UnauthorizedException("Private information");
        }
        return this.usersService.set2FA(idOrUsername, true);
    }

    @Post('users/:idOrUsername/disable2FA')
    @ApiOperation({
        summary: "Disable the 2FA for a user"
    })
    async disableUser2FA(@Req() request, @Param('idOrUsername') idOrUsername:string): Promise<void> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, idOrUsername)) {
            throw new UnauthorizedException("Private information");
        }
        return this.usersService.set2FA(idOrUsername, false);
    }

    @Post(":idOrUsername/blocks/:blockedUser")
    @ApiOperation({
        summary: "The given user will block another user"
    })
    async blockUser(@Req() request, @Param('idOrUsername') blocker: string, @Param('blockedUser') blocked: string): Promise<void> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, blocker)) {
            throw new UnauthorizedException("Private information");
        }
        return this.usersService.blockUser(blocker, blocked);
    }

    @Delete(":idOrUsername/blocks/:blockedUser")
    @ApiOperation({
        summary: "The given user will unblock another user"
    })
    async unblockUser(@Req() request, @Param('idOrUsername') blocker: string, @Param('blockedUser') blocked: string): Promise<void> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, blocker)) {
            throw new UnauthorizedException("Private information");
        }
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
    async uploadProfilePic(
        @Req() request,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: ".(png|jpeg|jpg)" })
                ]
            })
        ) file,
        @Param('idOrUsername') userId : string) {
		Logger.debug("Upload Profile Pic endpoint called");
        if (!this.checkIfAuthorized(request.requester_info.dataValues, userId)) {
            console.log("Unauthorized");
            throw new UnauthorizedException("Private information");
        }
        this.usersService.setUserProfilePic(userId, file.path)
        return { imagePath: file.path }
    }

    @Post('/test')
    async testMiddleware(@Req() request) {
        console.log(request.requester_info.dataValues);
    }

}
