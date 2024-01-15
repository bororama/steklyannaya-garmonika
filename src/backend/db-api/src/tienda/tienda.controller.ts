import { Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { TiendaService } from "./tienda.service"

@Controller('tienda')
export class TiendaController {
    constructor (
      private readonly tiendaService : TiendaService
    ) {}

  @Post("/buyPearls/:idOrUsername")
  async buyPearl(@Param('idOrUsername') user : string) : Promise<string> {
    return this.tiendaService.buyPearl(user)
  }

  @Post("/giveCoins/:idOrUsername/:coins")
  async giveCoins(@Param('idOrUsername') user : string, @Param('coins') coins : number) : Promise <string> {
    console.log(user)
    return this.tiendaService.giveCoins(user, coins);
  }
}
