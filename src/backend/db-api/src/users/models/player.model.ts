import { BelongsTo, Column, Default, ForeignKey, PrimaryKey, Table, Model, BelongsToMany, HasOne } from "sequelize-typescript";
import { User } from "./user.model";
import { Ban } from "../../bans/ban.model";

@Table
export class Player extends Model
{
    @PrimaryKey
    @ForeignKey(() => User)
    @Column
    id: number;

    @BelongsTo(() => User, {
        foreignKey: 'id',
        onDelete: 'CASCADE', // This line ensures cascading deletion
    })
    user: User;

    @Default(0)
    @Column
    defeats: number;

    @Default(0)
    @Column
    wins: number;

    @Default(0)
    @Column
    steps: number;

    @Default(0)
    @Column
    currency: number;

    @HasOne(() => Ban)
    ban?: Ban;
}
