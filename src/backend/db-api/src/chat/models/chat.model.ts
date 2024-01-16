import { AllowNull, AutoIncrement, BelongsTo, BelongsToMany, Column, Default, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { User } from "../../users/models/user.model";
import { ChatUsers } from "../../chat-user/models/chatUsers.model";
import { Friendship } from "../../users/models/friendship.model";

@Table ({
    initialAutoIncrement: '1'
})
export class Chat extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Default(null)
    @Column
    password: string;

    @Default(false)
    @Column
    isPrivateChat: boolean;

    @ForeignKey(() => Friendship)
    @AllowNull
    @Column
    friendshipId: number;

    @BelongsTo(() => Friendship, { onDelete: 'CASCADE'})
    friendship: Friendship;

    @BelongsToMany(() => User, {
        through: () => ChatUsers,
        onDelete: 'CASCADE'
    })
    users: User[];
}
