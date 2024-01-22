import { Injectable, Logger } from '@nestjs/common';
import { NewPlayer } from '../users/dto/new-player.dto';
import { PlayersService } from '../users/services/players.service';
import { AdminsService } from '../admins/admins.service';

@Injectable()
export class SeederService {
    constructor (
        private readonly logger: Logger,
        private readonly playersService: PlayersService,
        private readonly adminsService: AdminsService
    ) {}

    async seed() {
        const usersData: NewPlayer[] = [
            {
                userName: "Miguel",
                loginFt: "mmateo-t",
            },
            {
                userName: "Javi",
                loginFt: "javgonza",
            },
            {
                userName: "Pablo",
                loginFt: "pdiaz-pa",
            },
            {
                userName: "Nico",
                loginFt: "npinto-g",
            }
        ]

        await Promise.all(usersData.map(async (player: NewPlayer) => this.playersService.create(player)));
        this.logger.debug("Players created");
        this.logger.debug(`Rising player ${usersData[0].userName} to Admin`);
        await this.adminsService.riseToAdmin(usersData[0].userName);
    }
}
