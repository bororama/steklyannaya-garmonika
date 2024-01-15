import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Admin } from "../admins/admin.model";
import { Ban } from "./ban.model";
import { Player } from "../users/models/player.model";
import { BansService } from "./bans.service";

@Module({
    imports: [SequelizeModule.forFeature([Player, Admin, Ban])],
    providers: [BansService],
    exports: [SequelizeModule, BansService]
})
export class BansModule {}