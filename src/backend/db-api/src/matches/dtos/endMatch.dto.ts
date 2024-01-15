import { IsNotEmpty, IsInt } from "class-validator";

export class EndMatchDto {
    @IsNotEmpty({ message: 'Player1 field cannot be empty' })
    player1: string;
    @IsNotEmpty({ message: 'Player2 field cannot be empty' })
    player2: string;
    winner?: string;
    @IsInt({ message: 'Player1 Points field cannot be empty' })
    pointsPlayer1: number;
    @IsInt({ message: 'Player2 Points field cannot be empty' })
    pointsPlayer2: number;
}