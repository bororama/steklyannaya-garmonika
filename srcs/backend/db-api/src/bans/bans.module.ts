import { Module, forwardRef } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Admin } from "../admins/admin.model";
import { Ban } from "./ban.model";
import { Player } from "../users/models/player.model";
import { BansService } from "./bans.service";
import { UsersModule } from "../users/users.module";

@Module({
    imports: [SequelizeModule.forFeature([Player, Admin, Ban]), forwardRef(() => UsersModule)],
    providers: [BansService],
    exports: [SequelizeModule, BansService]
})
export class BansModule {}