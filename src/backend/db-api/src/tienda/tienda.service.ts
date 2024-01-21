import { Injectable, BadRequestException } from '@nestjs/common'
import { UsersService } from '../users/services/users.service'
import { ChatService } from '../chat/services/chat.service';

@Injectable()
export class TiendaService {
  private readonly pearlPrice : number = 10;
  private readonly necklacePrice : number = 30;

  constructor (
    private readonly userService : UsersService,
    private readonly chatService : ChatService
  ) {
  
  }

  async buyPearl(userId: string) : Promise<string> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new BadRequestException("User doesn\'t exist");
    }

    const result :string = await this.userService.subtractCoins(user, this.pearlPrice);

    if (result == 'ok') {
        this.userService.addPearls(user, 1)
    }

    return (result);
  }

  async buyNecklace(userId: string) : Promise<string> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new BadRequestException("User doesn\'t exist");
    }

    const chat = await this.chatService.createWithUser(user);
    if (!chat)
    {
      return ('chat_creation_error');
    }

    const result :string = await this.userService.subtractCoins(user, this.necklacePrice);

    return (result);
  }

  async giveCoins(user: string, amount: number) : Promise<string> {
    return this.userService.addCoins(user, amount);
  }
}
