import { AllowNull, AutoIncrement, BelongsToMany, Column, DataType, Default, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";
import { Chat } from "../../chat/models/chat.model";
import { ChatUsers } from "../../chat-user/models/chatUsers.model";
import { Block } from "./block.model";
import { UserStatus } from "../dto/user-status.enum";

@Table({
    initialAutoIncrement: '1'
})
export class User extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Unique({ name: "userName", msg: 'User Name already in use' })
    @AllowNull(false)
    @Column
    userName: string;

    @Unique({ name: "loginFT", msg: '42 User already registered' })
    @AllowNull(false)
    @Column
    loginFT: string;

    @Column
    profilePic: string;

    @Column
    inventory: string;

    @Default(false)
    @Column
    has2FA: boolean;

    @Default('')
    @Column
    secret2FA: string;

    @Default(UserStatus[UserStatus.offline])
    @Column({
        type: DataType.ENUM(...Object.values(UserStatus)),
        allowNull: false,
      })
    status: UserStatus;

    @Default(0)
    @Column
    franciscoins: number;

    @Default(0)
    @Column
    pearls: number;

    @Default(0)
    @Column
    necklaces: number;

    @BelongsToMany(() => Chat, () => ChatUsers)
    chats: Chat[];

    @BelongsToMany(() => User, () => Block, 'blockerId')
    blocked: User[]

    @BelongsToMany(() => User, () => Block, 'blockedId')
    blockedBy: User[]
}
