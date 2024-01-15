import { Player } from "../models/player.model";

export class LeaderboardPlayerDto {
	name: string;
	wins: number;
	defeats: number;

	constructor (player: Player) {
		this.name = player.user.userName;
		this.wins = player.wins;
		this.defeats = player.defeats;
	}
}