import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { User } from "../users/models/user.model";

@Table
export class Admin extends Model
{
    @PrimaryKey
    @ForeignKey(() => User)
    @Column
    id: number;

    @BelongsTo(() => User, {
        foreignKey: 'id',
        onDelete: 'CASCADE',
    })
    user: User;
}
