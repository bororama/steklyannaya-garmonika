import { Player } from "../models/player.model";
import { PublicPlayerDto } from "./public-player.dto";

export class FriendshipDto extends PublicPlayerDto {
	chat: number;

	constructor (friend: Player, chat: number) {
		super(friend);
		this.chat = chat;
	}
}