import { Controller, Get, Post, Delete, Param, ParseIntPipe, Body, ValidationPipe } from '@nestjs/common';
import { Match } from './models/match.model';
import { MatchesService } from './matches.service';
import { MatchAndUsersDto } from './dtos/matchWithUsers.dto';
import { EndMatchDto } from './dtos/endMatch.dto';
import { MatchPlayersDto } from './dtos/matchPlayers.dto';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { MatchDto } from './dtos/match.dto';
import { MatchPointsDto } from './dtos/matchPoints.dto';

@Controller('matches')
@ApiTags("Matches")
export class MatchesController {
    constructor (
        private readonly matchService: MatchesService
    ) {}

    @Get()
    findAll(): Promise<Match[]> {
        return this.matchService.findAll();
    }

    @Get('/active')
    findStartedMatches(): Promise<Match[]> {
        return this.matchService.getStartedMatches();
    }

    @Get(":idOrUsername")
    getUserMatches(@Param('idOrUsername') user: string): Promise<MatchAndUsersDto[]> {
        return this.matchService.getPlayerMatches(user).then(matches => matches.map(m => new MatchAndUsersDto(m)));
    }

    @Post(":id/startMatch")
    startMatchById(@Param('id', ParseIntPipe) matchId: number): Promise<void> {
        return this.matchService.startMatchById(matchId);
    }

    @Post("startMatch")
    @ApiBody({ type: MatchPlayersDto, required: true })
    startMatch(@Body('matchInfo', new ValidationPipe()) matchInfo: MatchPlayersDto): Promise<void> {
        return this.matchService.startMatch(matchInfo.player1, matchInfo.player2);
    }

    @Post(":id/endMatch")
    @ApiBody({ type: MatchPointsDto, required: true })
    endMatchById(@Param('id', ParseIntPipe) id: number, @Body(new ValidationPipe()) matchInfo: MatchPointsDto): Promise<void> {
        return this.matchService.finishMatchById(id, matchInfo);
    }

    @Post("endMatch")
    @ApiBody({ type: MatchPlayersDto, required: true })
    endMatch(@Body(new ValidationPipe()) matchInfo: EndMatchDto): Promise<void> {
        return this.matchService.finishMatch(matchInfo);
    }

    @Post(":idOrUsername")
    async createMatch(@Param('idOrUsername') player: string): Promise<MatchAndUsersDto> {
        const match = await this.matchService.createMatch(player);
        return new MatchAndUsersDto(match);
    }

    @Post(":idOrUsername/challenge/:rival")
    async createTwoPlayerMatch(@Param('idOrUsername') player1: string, @Param('rival') player2: string): Promise<MatchAndUsersDto> {
        const match = await this.matchService.createMatch(player1, player2);
        return new MatchAndUsersDto(match);
    }

    @Post()
    async logMatch(@Body('matchInfo', new ValidationPipe()) matchInfo: MatchDto): Promise<MatchDto> {
        return this.matchService.logMatch(matchInfo).then(match => {
            const matchDto = new MatchDto();
            matchDto.player1 = matchInfo.player1;
            matchDto.player2 = matchInfo.player2;
            matchDto.startDate = match.startDate;
            matchDto.endDate = match.endDate;
            matchDto.winner = matchInfo.winner; 
            return matchDto;
        });
    }

    @Get('/room/:roomId')
    getMatchByRoomId(roomId: number): Promise<MatchAndUsersDto> {
        return this.matchService.getByRoomId(roomId).then(match => new MatchAndUsersDto(match));
    }
}
