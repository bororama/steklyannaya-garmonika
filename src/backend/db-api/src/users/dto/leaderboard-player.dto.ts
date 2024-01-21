import { Player } from "../models/player.model";

export class LeaderboardPlayerDto {
	name: string;
	pearls: number;
	franciscoins: number;

	constructor (player: Player) {
		this.name = player.user.userName;
		this.pearls = player.user.pearls;
		this.franciscoins = player.user.franciscoins;
	}
}