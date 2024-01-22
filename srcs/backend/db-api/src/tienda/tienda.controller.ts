import { Controller, ParseIntPipe, Get, Param, Post, Req, UnauthorizedException } from "@nestjs/common";
import { TiendaService } from "./tienda.service"
import { ApiTags } from '@nestjs/swagger';
import { User } from "src/users/models/user.model";


@ApiTags('Shop')
@Controller('tienda')
export class TiendaController {
    constructor (
      private readonly tiendaService : TiendaService
    ) {}

    checkIfAuthorized(requester: User, userId: string) {
      console.log(requester);
      return isNaN(+userId)
      ? requester.userName == userId 
      :  requester.id == +userId ;
  }

  @Post("/buyPearl/:idOrUsername")
  async buyPearl(@Req() request, @Param('idOrUsername') user : string) : Promise<string> {
    if (!this.checkIfAuthorized(request.requester_info.dataValues, user)) {
      throw new UnauthorizedException("Private action");
    }
    return this.tiendaService.buyPearl(user);
  }

  @Post("/buyNecklace/:idOrUsername")
  async buyNecklace(@Req() request, @Param('idOrUsername') user : string) : Promise<string> {
    if (!this.checkIfAuthorized(request.requester_info.dataValues, user)) {
      throw new UnauthorizedException("Private action");
    }
    return this.tiendaService.buyNecklace(user);
  }

}
