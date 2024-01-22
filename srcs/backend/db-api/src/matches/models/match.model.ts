import { AutoIncrement, BelongsTo, Column, ForeignKey, HasOne, Model, PrimaryKey, Table, Default } from "sequelize-typescript";
import { User } from "../../users/models/user.model";
import { Player } from "../../users/models/player.model";

@Table({
    initialAutoIncrement: '1'
})
export class Match extends Model {

    @PrimaryKey
    @AutoIncrement
    @Column
    id:number;

    @Column
    roomId: number;

    @ForeignKey(() => Player)
    @Column({ allowNull: true, onDelete: 'SET NULL'})
    idPlayer1: number;

    @BelongsTo(() => Player, 'idPlayer1')
    player1: Player;

    @ForeignKey(() => Player)
    @Column({ allowNull: true, onDelete: 'SET NULL'})
    idPlayer2: number;

    @BelongsTo(() => Player, 'idPlayer2')
    player2?: Player;

    @Column
    startDate: Date;

    @Column
    endDate: Date;

    @Default(0)
    @Column
    pointsPlayer1: number;

    @Default(0)
    @Column
    pointsPlayer2: number;

    @ForeignKey(() => Player)
    @Column({ allowNull: true, onDelete: 'SET NULL'})
    winnerId: number;

    @BelongsTo(() => Player, 'winnerId')
    winner: Player;
}
