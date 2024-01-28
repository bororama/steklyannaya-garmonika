import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { User } from "./user.model";

@Table
export class Block extends Model {
    @PrimaryKey
    @ForeignKey(() => User)
    @Column
    blockerId: number

    @BelongsTo(() => User, 'blockerId')
    blocker: User

    @PrimaryKey
    @ForeignKey(() => User)
    @Column
    blockedId: number

    @BelongsTo(() => User, 'blockedId')
    blocked: User
}
