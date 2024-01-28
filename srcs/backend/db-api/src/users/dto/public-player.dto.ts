import { Player } from "../models/player.model";
import { PublicUserDto } from "./public-user.dto";

export class PublicPlayerDto extends PublicUserDto {
    defeats: number;
    wins: number;
    steps: number;

    constructor(player: Player) {
        super(player.user);
        this.defeats = player.defeats;
        this.wins = player.wins;
        this.steps = player.steps;
    }
}
