import { BadRequestException, Body, Controller, Get, Param, Post, Delete, ValidationPipe } from "@nestjs/common";
import { PlayersService } from "../services/players.service";
import { Player } from "../models/player.model";
import { NewPlayer } from "../dto/new-player.dto";
import { PlayerDto } from "../dto/player.dto";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { BansService } from "../../bans/bans.service";
import { UpdatePlayerDto } from "../dto/player-update.dto";
import { LeaderboardPlayerDto } from "../dto/leaderboard-player.dto";
import { FriendshipDto } from "../dto/friendship.dto";
import { PublicPlayerDto } from "../dto/public-player.dto";

@Controller('players')
@ApiTags("Player Specific Data")
export class PlayersController {
    constructor (
        private readonly playerService : PlayersService,
        private readonly bansService : BansService
    ) {}

    @Get()
    async findAll(): Promise<PlayerDto[]> {
        const players: Player[] = await this.playerService.findAll();
        const playerDtos: PlayerDto[] = players.map((player) => {
            const playerDto = new PlayerDto(player);

            return playerDto;
        });

        return playerDtos;
    }

    @Get('/leaderboard')
    leaderBoard(): Promise<LeaderboardPlayerDto[]> {
        return this.playerService.playerLeaderboard().then(players => players.map(p => new PlayerDto(p)));
    }

    @Get(':idOrUsername')
    async findOne(@Param('idOrUsername') id: string): Promise<PlayerDto> {
        const player: Player = await this.playerService.findOne(id);
        const playerDto = new PlayerDto(player);

        return playerDto;
    }

    @Post()
    @ApiBody({type: NewPlayer})
    async create(@Body(new ValidationPipe()) newPlayer: NewPlayer): Promise<PlayerDto> {
        const player: Player = await this.playerService.create(newPlayer);
        const playerDto = new PlayerDto(player);

        return playerDto;
    }

    @Post(':idOrUsername/sendFrienshipRequest/:newFriend')
    async sendFrienshipRequest(@Param('idOrUsername') user: string, @Param('newFriend') friend: string): Promise<void> {
        await this.playerService.sendFriendshipPetition(user, friend);
    }

    @Post(':idOrUsername/giftPearlTo/:newFriend')
    async giftPearl(@Param('idOrUsername') user: string, @Param('newFriend') friend: string): Promise<string> {
        return this.playerService.giftPearl(user, friend);
    }

    @Get(':idOrUsername/getFrienshipRequests')
    async getFriendshipRequest(@Param('idOrUsername') user: string): Promise<PublicPlayerDto[]> {
        return this.playerService.getReceivedFriendshipPetitions(user).then(players => players.map(p => new PublicPlayerDto(p)));
    }

    @Post(':idOrUsername/acceptFrienshipRequest/:newFriend')
    async addFriend(@Param('idOrUsername') user: string, @Param('newFriend') friend: string): Promise<void> {
        return this.playerService.changePetitionStatus(user, friend, true);
    }

    @Post(':idOrUsername/declineFrienshipRequest/:newFriend')
    async declineLove(@Param('idOrUsername') user: string, @Param('newFriend') friend: string): Promise<void> {
        return this.playerService.changePetitionStatus(user, friend, false);
    }

    @Post(':idOrUsername/endFriendship/:newEnemy')
    async deleteFriend(@Param('idOrUsername') user: string, @Param('newEnemy') enemy: string): Promise<void> {
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
    updatePlayerData(@Param('idOrUsername') user: string, @Body() newData: UpdatePlayerDto): Promise<PlayerDto> {
        return this.playerService.update(user, newData).then(player => new PlayerDto(player));
    }

}
