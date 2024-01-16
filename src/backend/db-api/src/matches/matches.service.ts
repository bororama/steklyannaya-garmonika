import { BadRequestException, Injectable } from '@nestjs/common';
import { Match } from './models/match.model';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/models/user.model';
import { Op } from 'sequelize';
import { MatchDto } from './dtos/match.dto';
import { PlayersService } from '../users/services/players.service';
import { UserStatus } from '../users/dto/user-status.enum';
import { Player } from '../users/models/player.model'
import { EndMatchDto } from './dtos/endMatch.dto';
import { MatchPointsDto } from './dtos/matchPoints.dto';

@Injectable()
export class MatchesService {
    constructor(
        @InjectModel(Match)
        private matchModel: typeof Match,
        private playerService: PlayersService
    ) {}

    async findAll(): Promise<Match[]> {
        return this.matchModel.findAll();
    }

    async getStartedMatches(): Promise<Match[]> {
        return this.matchModel.findAll({
            where: {
                startDate: {
                    [Op.ne]: null
                },
                endDate: {
                    [Op.eq]: null
                }
            }
        })
    }

    async findOne(id: number): Promise<Match> {
        return this.matchModel.findByPk(id, {
            include: [
                {
                    model: Player,
                    as: 'player1',
                    include: [
                        {
                            model: User
                        }
                    ]
                },
                {
                    model: Player,
                    as: 'player2',
                    include: [
                        {
                            model: User
                        }
                    ]
                }
            ]
        });
    }

    async createMatch(player1: string, player2?: string): Promise<Match> {
        const challenger = await this.playerService.findOne(player1);
        if (!challenger) {
            throw new BadRequestException("First player doesn't exist");
        }

        const challenged = (player2 ? await this.playerService.findOne(player2) : null);
        if (player2 && !challenged) {
            throw new BadRequestException("Second player doesn't exist");
        }

        let randRoom = Math.floor(Math.random() * 99900 + 100);
        return this.matchModel
        .create({
            idPlayer1: challenger.id,
            idPlayer2: challenged?.id,
            roomId: randRoom,
            startDate: null
        })
        .then(match => {
            match.player1 = challenger;
            match.player2 = challenged;
            match.roomId = randRoom;
            return match;
        });
    }

    async getPlayerMatches(player: string): Promise<Match[]> {
        const user = await this.playerService.playerExists(player);
        if (!user) {
            throw new BadRequestException("Player doesn't exist");
        }

        return this.matchModel.findAll({
            where: {
                [Op.or]: [
                    {
                        idPlayer1: user.id
                    },
                    {
                        idPlayer2: user.id
                    }
                ]
            },
            include: [
                {
                    model: Player,
                    as: 'player1',
                    include: [
                        {
                          model: User
                        }
                    ]
                },
                {
                    model: Player,
                    as: 'player2',
                    include: [
                        {
                          model: User
                        }
                    ]
                }
            ]
        });
    }

    delete(matchId: number): Promise<void> {
        return this.matchModel.destroy({
            where: {
                [Op.or]: [
                    { id: matchId },
                    { roomId: matchId }
                ]
            }
        }).then();
    }

    getByRoomId(roomId: number): Promise<Match> {
        return this.matchModel.findOne({
            where: {
                roomId: roomId
            },
            include: [
                {
                    model: Player,
                    as: 'player1',
                    include: [
                        {
                          model: User
                        }
                    ]
                },
                {
                    model: Player,
                    as: 'player2',
                    include: [
                        {
                          model: User
                        }
                    ]
                }
            ]
        });
    }

    // TODO: When the user status changes from a boolean to a enum with (online/offline/in-match) the user won't be able to
    // join a match if it is already in one.
    async joinMatch(player: string, id: number): Promise<Match> {
        const user = await this.playerService.playerExists(player);
        if (!user) {
            throw new BadRequestException("Player doesn't exist");
        }
        
        const match = await this.matchModel.findByPk(id, {
            include: {
                model: Player,
                attributes: ['id', 'userName'],
                as: 'player1'
            }
        });
        if (!match) {
            throw new BadRequestException("Match doesn't exist");
        }

        if (match.idPlayer2) {
            if (match.idPlayer2 != user.id) {
                throw new BadRequestException("Match has already two players");
            }
            else {
                return match;
            }
        }
        match.idPlayer2 = user.id;
        match.startDate = new Date();
        return match.save();
    }

    async startMatchById(id: number): Promise<void> {
        const match = await this.matchModel.findByPk(id, {
            include: [
                {
                    model: Player,
                    as: 'player1',
                    include: [
                        {
                            model: User
                        }
                    ]
                },
                {
                    model: Player,
                    as: 'player2',
                    include: [
                        {
                            model: User
                        }
                    ]
                }
            ]
        });
        if (!match) {
            throw new BadRequestException("Match doesn't exist");
        }

        if (!match.idPlayer2) {
            throw new BadRequestException("Match cannot start without a second player");
        }

        const statusPlayer1 = await this.playerService.getPlayerStatus(match.idPlayer1);
        const statusPlayer2 = await this.playerService.getPlayerStatus(match.idPlayer2);
        if (statusPlayer1 == UserStatus.inMatch)
        {
            throw new BadRequestException("First player is already in a match");
        }
        else if (statusPlayer2 == UserStatus.inMatch)
        {
            throw new BadRequestException("Second player is already in a match");
        }

        match.player1.user.status = UserStatus[UserStatus.inMatch];
        match.player1.user.save();
        match.player2.user.status = UserStatus[UserStatus.inMatch];
        match.player2.user.save();

        match.startDate = new Date();
        await match.save();
    }

    async startMatchByRoom(roomId: number):Promise <void> {
      const match = await this.getByRoomId(roomId)
      if (!match) {
          throw new BadRequestException("Match doesn't exist");
      }
      match.startDate = new Date();
      match.save()
    }

    // TODO: When the user status changes from a boolean to a enum with (online/offline/in-match) the user won't be able to
    // create a new match if there is already in one
    async startMatch(player1: string, player2: string): Promise<void> {
        const challenger1 = await this.playerService.playerExists(player1);
        if (!challenger1) {
            throw new BadRequestException("First player doesn't exist");
        }
        else if (challenger1.user.status == UserStatus.inMatch)
        {
            throw new BadRequestException("First player is already in a match");
        }

        const challenger2 = await this.playerService.playerExists(player2);
        if (!challenger2) {
            throw new BadRequestException("Second player doesn't exist");
        }
        else if (challenger2.user.status == UserStatus.inMatch)
        {
            throw new BadRequestException("Second player is already in a match");
        }

        const match = await this.matchModel.findOne({
            where: {
                [Op.or] : [
                    {
                        idPlayer1: challenger1,
                        idPlayer2: challenger2
                    },
                    {
                        idPlayer1: challenger2,
                        idPlayer2: challenger1
                    }
                ]
            }
        });
        if (!match) {
            throw new BadRequestException("Match doesn't exist");
        }

        match.player1.user.status = UserStatus[UserStatus.inMatch];
        match.player1.user.save();
        match.player2.user.status = UserStatus[UserStatus.inMatch];
        match.player2.user.save();
        match.endDate = new Date();
        await match.save();
    }

    async finishMatchByRoom(roomId: number, winner: string, pointsP1: number, pointsP2: number):Promise <void> {
      const match = await this.getByRoomId(roomId)
      if (!match) {
          throw new BadRequestException("Match doesn't exist");
      }
      if (winner == 'player1')
        this.finishMatchById(match.id, {pointsPlayer1: pointsP1, pointsPlayer2: pointsP2, winner: '' + match.player1.id})
      else
        this.finishMatchById(match.id, {pointsPlayer1: pointsP1, pointsPlayer2: pointsP2, winner: '' + match.player2.id})

    }

            
    async finishMatchById(id: number, matchInfo: MatchPointsDto): Promise<void> {
        const match = await this.matchModel.findByPk(id, {
            include: [
                {
                    model: Player,
                    as: 'player1',
                    attributes: ['id'],
                    include: [
                        {
                            model: User
                        }
                    ]
                },
                {
                    model: Player,
                    as: 'player2',
                    attributes: ['id'],
                    include: [
                        {
                            model: User
                        }
                    ]
                }
            ]
        });
        if (!match) {
            throw new BadRequestException("Match doesn't exist");
        }


        if (!match.startDate) {
            throw new BadRequestException("Match is not even started");
        }

        match.endDate = new Date();
        // TODO: Wins and defeats are not being saved
        if (matchInfo.winner !== undefined && matchInfo.winner !== null) {
            const winnerId = (await this.playerService.playerExists(matchInfo.winner))?.id;
            if (!winnerId) {
                throw new BadRequestException("Winner doesn't exists");
            }

            if (!match.player2) {
                throw new BadRequestException("First player cannot win a match without second player")
            }

            if (winnerId != match.idPlayer1 && winnerId != match.idPlayer2) {
                throw new BadRequestException("Winner is not related to this match");
            }

            if (winnerId == match.idPlayer1) {
                match.player1.wins += 1;
                match.player2.defeats += 1;
            }
            else {
                match.player2.wins += 1;
                match.player1.defeats += 1;
            }

            match.winnerId = winnerId;
        }
        match.player1.user.status = UserStatus[UserStatus.online];
        await match.player1.user.save();
        match.player2.user.status = UserStatus[UserStatus.online];
        await match.player2.user.save();
        match.pointsPlayer1 = matchInfo.pointsPlayer1;
        match.pointsPlayer2 = matchInfo.pointsPlayer2;
        await match.save();
    }

    async finishMatch(matchInfo: EndMatchDto): Promise<void> {
        const challenger1 = await this.playerService.playerExists(matchInfo.player1);
        if (!challenger1) {
            throw new BadRequestException("First player doesn't exist");
        }

        const challenger2 = await this.playerService.playerExists(matchInfo.player2);
        if (!challenger2) {
            throw new BadRequestException("First player doesn't exist");
        }

        if (matchInfo.winner && matchInfo.winner != matchInfo.player1 && matchInfo.winner != matchInfo.player2)
        {
            throw new BadRequestException("Winner username is not related to this match");
        }

        const match = await this.matchModel.findOne({
            where: {
                endDate: null,
                [Op.or] : [
                    {
                        idPlayer1: challenger1,
                        idPlayer2: challenger2
                    },
                    {
                        idPlayer1: challenger2,
                        idPlayer2: challenger1
                    }
                ]
            },
            include: [
                {
                    model: Player,
                    as: 'player1',
                    attributes: ['id'],
                    include: [
                        {
                            model: User
                        }
                    ]
                },
                {
                    model: Player,
                    as: 'player2',
                    attributes: ['id'],
                    include: [
                        {
                            model: User
                        }
                    ]
                }
            ]
        });
        if (!match) {
            throw new BadRequestException("Match doesn't exist");
        }

        if (!match.startDate) {
            match.startDate = new Date();
        }

        match.endDate = new Date();
        if (matchInfo.winner) {
            if (!match.player2)
            {
                throw new BadRequestException("First player cannot win a match without second player");
            }

            if (matchInfo.winner == matchInfo.player1) {
                match.winnerId = match.idPlayer1;
                match.player1.wins += 1;
                match.player2.defeats += 1;
            }
            else {
                match.winnerId = match.idPlayer2;
                match.player2.wins += 1;
                match.player1.defeats += 1;
            }
        }
        match.pointsPlayer1 = matchInfo.pointsPlayer1;
        match.pointsPlayer2 = matchInfo.pointsPlayer2;
        match.player1.user.status = UserStatus[UserStatus.inMatch];
        match.player1.user.save();
        match.player2.user.status = UserStatus[UserStatus.inMatch];
        match.player2.user.save();
        await match.save();
    }

    async logMatch(matchInfo: MatchDto): Promise<Match> {
        const challenger1 = await this.playerService.playerExists(matchInfo.player1);
        if (!challenger1) {
            throw new BadRequestException("First player doesn't exist");
        }

        const challenger2 = await this.playerService.playerExists(matchInfo.player2);
        if (!challenger2) {
            throw new BadRequestException("First player doesn't exist");
        }

        if (matchInfo.winner)
        {
            if (!matchInfo.player2)
            {
                throw new BadRequestException("First player cannot win a match without second player");
            }

            if (matchInfo.winner != matchInfo.player1 && matchInfo.winner != matchInfo.player2) {
                throw new BadRequestException("Winner username is not related to this match");
            }

            if (matchInfo.winner == matchInfo.player1) {
                challenger1.wins += 1;
                challenger2.defeats += 1;
            }
            else {
                challenger2.wins += 1;
                challenger1.defeats += 1;
            }
        }

        return this.matchModel.create({
            idPlayer1: challenger1,
            idPlayer2: challenger2,
            winner: matchInfo.winner ? (matchInfo.winner == matchInfo.player1 ? challenger1 : challenger2) : null,
            startDate: matchInfo.startDate,
            endDate: matchInfo.endDate,
            pointsPlayer1: matchInfo.pointsPlayer1,
            pointsPlayer2: matchInfo.pointsPlayer2
        });
    }
}
