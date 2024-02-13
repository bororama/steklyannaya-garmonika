import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TiendaController } from './tienda.controller'
import { TiendaService } from './tienda.service'
import { UsersModule } from '../users/users.module'
import { ChatModule } from '../chat/chat.module';
import { AuthMiddleware } from 'src/middleware/auth-middleware';
import { AuthenticMiddleware } from 'src/middleware/authenticity-middleware';
import { ConnectedMiddleware } from 'src/middleware/connected-middleware';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, ChatModule, ConfigModule],
  controllers: [TiendaController],
  providers: [TiendaService]
})

export class TiendaModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(AuthMiddleware, AuthenticMiddleware, ConnectedMiddleware)
          .forRoutes(TiendaController);
  }
}
