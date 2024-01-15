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
                email: "mmateo-t@student.42madrid.com",
            },
            {
                userName: "Javi",
                loginFt: "javgonza",
                email: "javgonza@student.42madrid.com",
            },
            {
                userName: "Pablo",
                loginFt: "pdiaz-pa",
                email: "pdiaz-pa@student.42madrid.com",
            },
            {
                userName: "Nico",
                loginFt: "npinto-g",
                email: "npinto-g@student.42madrid.com",
            }
        ]

        await Promise.all(usersData.map(async (player: NewPlayer) => this.playersService.create(player)));
        this.logger.debug("Players created");
        this.logger.debug(`Rising player ${usersData[0].userName} to Admin`);
        await this.adminsService.riseToAdmin(usersData[0].userName);
    }
}
