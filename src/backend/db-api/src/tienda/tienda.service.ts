import { Injectable, BadRequestException } from '@nestjs/common'
import { UsersService } from '../users/services/users.service'
import { InjectModel } from '@nestjs/sequelize'

@Injectable()
export class TiendaService {
  private readonly pearlPrice : number = 1;
  private readonly necklacePrice : number = 2;

  constructor (
    private userService : UsersService
  ) {
  
  }

  async buyPearl(user: string) : Promise<string> {

    const result :string = await this.userService.subtractCoins(user, this.pearlPrice);

    if (result == 'ok') {
        this.userService.addPearls(user, 1)
    }

    return (result);
  }

  async buyNecklace(user: string) : Promise<string> {
    const result :string = await this.userService.subtractCoins(user, this.necklacePrice);

    if (result == 'ok') {
        this.userService.addNecklace(user, 1)
    }

    return (result);
  }

  async giveCoins(user: string, amount: number) : Promise<string> {
    return this.userService.addCoins(user, amount);
  }
}
