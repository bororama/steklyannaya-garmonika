import { Module } from '@nestjs/common';
import { TiendaController } from './tienda.controller'
import { TiendaService } from './tienda.service'
import { UsersModule } from '../users/users.module'
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [UsersModule, ChatModule],
  controllers: [TiendaController],
  providers: [TiendaService]
})

export class TiendaModule {}
