import { BadRequestException, Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Ban } from "./ban.model";
import { Player } from "../users/models/player.model";
import { Admin } from "../admins/admin.model";

@Injectable()
export class BansService {
    constructor(
        @InjectModel(Ban)
        private banModel: typeof Ban
    ) {}

    async isBanned(player: Player): Promise<boolean> {
        return this.banModel.findOne({
            where: {
                playerId: player.id
            }
        }).then(b => b != null && b != undefined);
    }

    async banUser(player: Player, banner: Admin): Promise<void> {
        await this.banModel.create({
            adminId: banner.id,
            playerId: player.id,
        });
    }

    async unBanUser(player: Player): Promise<void> {
        await this.banModel.destroy({
            where: {
                playerId: player.id
            }
        });
    }
}
