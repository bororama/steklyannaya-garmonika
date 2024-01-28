import { IsDefined } from "class-validator";

export class MatchPointsDto {
    @IsDefined({ message: 'Player1 Points field cannot be empty' })
	pointsPlayer1: number;
    @IsDefined({ message: 'Player2 Points field cannot be empty' })
	pointsPlayer2: number;
    winner?: string;
}