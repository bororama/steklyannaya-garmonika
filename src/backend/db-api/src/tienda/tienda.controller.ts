import { Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { TiendaService } from "./tienda.service"
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';


@ApiTags('Shop')
@Controller('tienda')
export class TiendaController {
    constructor (
      private readonly tiendaService : TiendaService
    ) {}

  @Post("/buyPearl/:idOrUsername")
  async buyPearl(@Param('idOrUsername') user : string) : Promise<string> {
    return this.tiendaService.buyPearl(user);
  }

  @Post("/buyNecklace/:idOrUsername")
  async buyNecklace(@Param('idOrUsername') user : string) : Promise<string> {
    return this.tiendaService.buyNecklace(user);
  }

  @Post("/giveCoins/:idOrUsername/:coins")
  async giveCoins(@Param('idOrUsername') user : string, @Param('coins') coins : number) : Promise <string> {
    console.log(user)
    return this.tiendaService.giveCoins(user, coins);
  }
}
