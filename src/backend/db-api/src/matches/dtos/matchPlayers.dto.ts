import { IsNotEmpty } from "class-validator";

export class MatchPlayersDto {
    @IsNotEmpty({ message: 'Player1 field cannot be empty' })
    player1: string;
    @IsNotEmpty({ message: 'Player2 field cannot be empty' })
    player2: string;
    pointsPlayer1: number;
    pointsPlayer2: number;
}