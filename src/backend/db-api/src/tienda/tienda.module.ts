import { Module } from '@nestjs/common';
import { TiendaController } from './tienda.controller'
import { TiendaService } from './tienda.service'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [UsersModule],
  controllers: [TiendaController],
  providers: [TiendaService]
})

export class TiendaModule {}
