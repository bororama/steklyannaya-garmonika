import { Injectable, Logger, BadRequestException } from "@nestjs/common";
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
        try {
            const result = await this.banModel.create({
                adminId: banner.id,
                playerId: player.id,
            });
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                error.errors.forEach((validationError) => {
                if (validationError.type == 'unique violation') {
                    throw new BadRequestException("User is already banned");
                } else {
                    throw new BadRequestException('Other validation error:', validationError.message);
                }
                });
            } else {
                console.error('Error:', error);
                throw new BadRequestException("There was an error");
            }
        }
    }

    async unBanUser(player: Player): Promise<void> {
        await this.banModel.destroy({
            where: {
                playerId: player.id
            }
        });
    }
}
