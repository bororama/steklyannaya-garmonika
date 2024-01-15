import { Logger } from "@nestjs/common";
import { Player } from "../models/player.model";
import { UserDto } from "./user.dto";

export class PlayerDto extends UserDto {
    defeats: number;
    wins: number;
    steps: number;
    pearls: number;
    necklaces: number;
    franciscoins: number;

    constructor(player: Player) {
        super(player.user);
        this.defeats = player.defeats;
        this.wins = player.wins;
        this.steps = player.steps;
        this.pearls = player.user.pearls;
        this.necklaces = player.user.necklaces;
        this.franciscoins = player.user.franciscoins;
    }
}
