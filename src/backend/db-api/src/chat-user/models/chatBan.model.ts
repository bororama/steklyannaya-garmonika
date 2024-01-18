import { BelongsTo, Column, Default, ForeignKey, Model, PrimaryKey, Table, Sequelize } from "sequelize-typescript";
import { User } from "../../users/models/user.model";
import { Chat } from "../../chat/models/chat.model";

@Table
export class ChatBans extends Model {
    @PrimaryKey
    @ForeignKey(() => User)
    @Column
    userId: number;

    @BelongsTo(() => User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
    })
    user: User

    @PrimaryKey
    @ForeignKey(() => Chat)
    @Column
    chatId: number;

    @BelongsTo(() => Chat)
    chat: Chat

    @Column
    endDate: Date;
}