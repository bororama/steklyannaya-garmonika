import { Player } from "../models/player.model";

export class LeaderboardPlayerDto {
	name: string;
	pearls: number;
	necklaces: number;

	constructor (player: Player) {
		this.name = player.user.userName;
		this.pearls = player.user.pearls;
		this.necklaces = player.user.necklaces;
	}
}