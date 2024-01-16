import { BelongsTo, Column, Default, ForeignKey, Model, PrimaryKey, Table, HasOne, BeforeDestroy, AutoIncrement } from "sequelize-typescript";
import { Player } from "./player.model";
import { Chat } from "../../chat/models/chat.model";

@Table({
    initialAutoIncrement: '1'
})
export class Friendship extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number

    @ForeignKey(() => Player)
    @Column
    userId: number

    @ForeignKey(() => Player)
    @Column
    friendId: number

    @Default(false)
    @Column
    accepted: boolean;

    @Column
    @ForeignKey(() => Chat)
    chatId: number;

    @BelongsTo(() => Player, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
    })
    user: Player

    @BelongsTo(() => Player, {
        foreignKey: 'friendId',
        onDelete: 'CASCADE',
    })
    friend: Player

    @HasOne(() => Chat)
    chat: Chat;
}