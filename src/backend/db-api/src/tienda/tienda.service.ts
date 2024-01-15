import { Injectable, BadRequestException } from '@nestjs/common'
import { UsersService } from '../users/services/users.service'
import { InjectModel } from '@nestjs/sequelize'

@Injectable()
export class TiendaService {
  constructor (
    private userService : UsersService
  ) {
  
  }

  async buyPearl(user: string) : Promise<string> {
    const pearlPrice : number = 10;

    const result :string = await this.userService.subtractCoins(user, pearlPrice);

    if (result == 'ok') {
        this.userService.addPearls(user, 1)
    }

    return (result);
  }

  async giveCoins(user: string, amount: number) : Promise<string> {
    console.log(user)
    return this.userService.addCoins(user, amount)
  }
}
