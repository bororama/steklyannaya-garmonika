import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Ban } from "./ban.model";
import { Player } from "../users/models/player.model";
import { Admin } from "../admins/admin.model";
import { UserStatus } from "../users/dto/user-status.enum";
import { UsersService } from "../users/services/users.service";

@Injectable()
export class BansService {
    constructor(
        @InjectModel(Ban)
        private banModel: typeof Ban,
        private readonly userService: UsersService
    ) {}

    async isBanned(player: Player): Promise<boolean> {
        return this.banModel.findOne({
            where: {
                playerId: player.id
            }
        }).then(b => b != null && b != undefined);
    }

    async isBannedById(player: number): Promise<boolean> {
        return this.banModel.findOne({
            where: {
                playerId: player
            }
        }).then(b => b != null && b != undefined);
    }

    async banUser(player: Player, banner?: Admin): Promise<void> {
        try {
            let user = await this.userService.findOneById(player.id);
            user.status = UserStatus.offline;
            await user.save();
            const result = await this.banModel.create({
                adminId: banner?.id,
                playerId: player.id,
            });
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                error.errors.forEach((validationError) => {
                if (validationError.type == 'unique violation') {
                    throw new BadRequestException("User is already banned");
                } else {
                    Logger.warn(`${validationError.type}: ${validationError.message}`);
                    throw new BadRequestException("There was an error");
                }
                });
            } else {
                Logger.warn('Error:', error);
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
