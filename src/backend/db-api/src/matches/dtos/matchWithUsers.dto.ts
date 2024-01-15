import { Match } from "../models/match.model";
import { PlayerDto } from "../../users/dto/player.dto";

export class MatchAndUsersDto {
    id: number;
    player1: PlayerDto;
    player2?: PlayerDto;
    startDate: Date;
    endDate: Date;
    winner: PlayerDto;
    roomId: number;
    pointsPlayer1: number;
    pointsPlayer2: number;

    constructor (match: Match) {
        this.id = match.id;
        if (match.player1) { this.player1 = new PlayerDto(match.player1); }
        if (match.player2) { this.player2 = new PlayerDto(match.player2); }
        this.startDate = match.startDate;
        this.endDate = match.endDate;
        if (match.winner == undefined)
          this.winner = undefined
        else
            this.winner = new PlayerDto(match.winner);
        this.roomId = match.roomId;
        this.pointsPlayer1 = match.pointsPlayer1;
        this.pointsPlayer2 = match.pointsPlayer2;
    }
}
