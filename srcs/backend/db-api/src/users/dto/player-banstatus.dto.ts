import { Player } from "../models/player.model";
import { PlayerDto } from "./player.dto";

export class PlayerBanStatusDto extends PlayerDto {
    isBanned: boolean = false;

    constructor (player: Player) {
        super(player);
        if (player.ban) {
            this.isBanned = true;
        }
    }
}