import { BadRequestException, Body, Controller, Get, Param, Post, Delete, ValidationPipe, UnauthorizedException, Req } from "@nestjs/common";
import { PlayersService } from "../services/players.service";
import { Player } from "../models/player.model";
import { PlayerDto } from "../dto/player.dto";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { BansService } from "../../bans/bans.service";
import { UpdatePlayerDto } from "../dto/player-update.dto";
import { LeaderboardPlayerDto } from "../dto/leaderboard-player.dto";
import { FriendshipDto } from "../dto/friendship.dto";
import { PublicPlayerDto } from "../dto/public-player.dto";
import { AdminsService } from "src/admins/admins.service";
import { MatchesService } from "src/matches/matches.service";
import { User } from "../models/user.model";

@ApiBearerAuth()
@Controller('players')
@ApiTags("Player Specific Data")
export class PlayersController {
    constructor (
        private readonly playerService : PlayersService,
        private readonly bansService : BansService,
        private readonly adminService : AdminsService,
        private readonly matchService : MatchesService
    ) {}

    checkIfAuthorized(requester: User, userId: string) {
        console.log(requester);
        return isNaN(+userId)
        ? requester.userName == userId 
        :  requester.id == +userId ;
    }

    @Get()
    async findAll(): Promise<PlayerDto[]> {
        const players: Player[] = await this.playerService.findAll();
        return Promise.all(players.map(async(player) => {
            const isAdmin = await this.adminService.isAdmin(player.id);
            const playerDto = new PlayerDto(player, isAdmin);

            return playerDto;
        }));
    }

    @Get('/leaderboard')
    leaderBoard(): Promise<LeaderboardPlayerDto[]> {
        return this.playerService.playerLeaderboard().then(players => players.map(p => new LeaderboardPlayerDto(p)));
    }

    @Get(':idOrUsername')
    async findOne(@Param('idOrUsername') id: string): Promise<PlayerDto> {
        const player: Player = await this.playerService.findOne(id);
        const matchRoomId: number = await this.matchService.getPlayerCurrentMatchByPlayerId(player.id).then(match => match?.roomId);
        const playerDto = new PlayerDto(player, await this.adminService.isAdmin(player.id), matchRoomId);

        return playerDto;
    }

    @Post(':idOrUsername/sendFrienshipRequest/:newFriend')
    async sendFrienshipRequest(@Req() request, @Param('idOrUsername') user: string, @Param('newFriend') friend: string): Promise<void> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, user)) {
            throw new UnauthorizedException("Private action");
        }
        return this.playerService.sendFriendshipPetition(user, friend);
    }

    @Post(':idOrUsername/giftPearlTo/:newFriend')
    async giftPearl(@Req() request, @Param('idOrUsername') user: string, @Param('newFriend') friend: string): Promise<string> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, user)) {
            throw new UnauthorizedException("Private action");
        }
        return this.playerService.giftPearl(user, friend);
    }

    @Get(':idOrUsername/getFrienshipRequests')
    async getFriendshipRequest(@Req() request, @Param('idOrUsername') user: string): Promise<PublicPlayerDto[]> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, user)) {
            throw new UnauthorizedException("Private information");
        }
        return this.playerService.getReceivedFriendshipPetitions(user).then(players => players.map(p => new PublicPlayerDto(p)));
    }

    @Post(':idOrUsername/acceptFrienshipRequest/:newFriend')
    async addFriend(@Req() request, @Param('idOrUsername') user: string, @Param('newFriend') friend: string): Promise<void> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, user)) {
            throw new UnauthorizedException("Private action");
        }
        return this.playerService.changePetitionStatus(user, friend, true);
    }

    @Post(':idOrUsername/declineFrienshipRequest/:newFriend')
    async declineLove(@Req() request, @Param('idOrUsername') user: string, @Param('newFriend') friend: string): Promise<void> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, user)) {
            throw new UnauthorizedException("Private action");
        }
        return this.playerService.changePetitionStatus(user, friend, false);
    }

    @Post(':idOrUsername/endFriendship/:newEnemy')
    async deleteFriend(@Req() request, @Param('idOrUsername') user: string, @Param('newEnemy') enemy: string): Promise<void> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, user)) {
            throw new UnauthorizedException("Private action");
        }
        return this.playerService.deleteFriend(user, enemy);
    }

    @Get(':idOrUsername/getFriends')
    async getFriends(@Param('idOrUsername') user: string): Promise<FriendshipDto[]> {
        return this.playerService.getFriends(user).then(friends => friends.map(f => {
            const friend = f.friend ? f.friend : f.user;
            return new FriendshipDto(friend, f.chatId);
        }))
    }

    @Get(':idOrUsername/isFriend/:friendIdOrUsername')
    async isFriend(@Param('idOrUsername') user: string, @Param('friendIdOrUsername') friend: string): Promise<string> {
      return this.playerService.isFriend(user, friend)
    }

    @Get(':idOrUsername/banned')
    async isBanned(@Param('idOrUsername') user: string): Promise<boolean> {
        const player = await this.playerService.playerExists(user);
        if (!player) {
            throw new BadRequestException('User is not a player');
        } 
        return this.bansService.isBanned(player);
    }

    @Post(':idOrUsername/update')
    updatePlayerData(@Req() request, @Param('idOrUsername') user: string, @Body() newData: UpdatePlayerDto): Promise<PlayerDto> {
        if (!this.checkIfAuthorized(request.requester_info.dataValues, user)) {
            throw new UnauthorizedException("Private action");
        }
        return this.playerService.update(user, newData).then(player => new PlayerDto(player));
    }

}
