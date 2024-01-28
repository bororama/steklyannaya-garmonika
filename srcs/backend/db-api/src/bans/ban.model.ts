import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Admin } from "../admins/admin.model";
import { Player } from "../users/models/player.model";

@Table
export class Ban extends Model {
    @ForeignKey(() => Admin)
    @Column({ allowNull: true, onDelete: 'SET NULL' })
    adminId: number;

    @BelongsTo(() => Admin, 'adminId')
    admin: Admin;

    @ForeignKey(() => Player)
    @PrimaryKey
    @Column
    playerId: number;

    @BelongsTo(() => Player, {
        foreignKey: 'playerId',
        onDelete: 'CASCADE',
    })
    player: Player;
}