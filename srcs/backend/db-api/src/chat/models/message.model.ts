import { AutoIncrement, ForeignKey, BelongsTo, Column, Model, PrimaryKey, Table } from "sequelize-typescript";
import { User } from "../../users/models/user.model";
import { Chat } from "./chat.model";

@Table({
	initialAutoIncrement: '1'
})
export class Message extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column
	id: number;

	@ForeignKey(() => User)
	@Column
	senderId: number;

	@ForeignKey(() => User)
	@Column
	chatId: number;

	@Column
	sentDate: Date;

	@Column
	message: string;

	@BelongsTo(() => User, 'senderId')
	sender: User;

	@BelongsTo(() => Chat, 'chatId')
	chat: Chat;
}