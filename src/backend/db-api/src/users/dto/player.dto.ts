import { Logger } from "@nestjs/common";
import { Player } from "../models/player.model";
import { UserDto } from "./user.dto";
import { UserStatus } from "./user-status.enum";

export class PlayerDto extends UserDto {
    defeats: number;
    wins: number;
    steps: number;
    pearls: number;
    necklaces: number;
    franciscoins: number;
    status: UserStatus;
    isAdmin?: boolean;
    matchRoomId?: number;

    constructor(player: Player, isAdmin?: boolean, matchRoomId?: number) {
        super(player.user);
        this.defeats = player.defeats;
        this.wins = player.wins;
        this.steps = player.steps;
        this.pearls = player.user.pearls;
        this.necklaces = player.user.necklaces;
        this.franciscoins = player.user.franciscoins;
        this.status = player.user.status;
        this.isAdmin = isAdmin;
        this.matchRoomId = matchRoomId
    }
}
