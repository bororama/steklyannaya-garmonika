import { AutoIncrement, Column, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
    initialAutoIncrement: '1'
})
export class Item extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number

    @Column
    name: string

    @Column
    description: string
}
