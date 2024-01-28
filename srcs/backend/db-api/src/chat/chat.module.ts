import { Module, forwardRef, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ChatController } from './chat.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Chat } from './models/chat.model';
import { ChatUserModule } from '../chat-user/chat-user.module';
import { UsersModule } from '../users/users.module';
import { MessageService } from './services/message.service';
import { Message } from './models/message.model';
import { AuthMiddleware } from 'src/middleware/auth-middleware';
import { AuthenticMiddleware } from 'src/middleware/authenticity-middleware';
import { ConnectedMiddleware } from 'src/middleware/connected-middleware';

@Module({
  imports: [SequelizeModule.forFeature([Chat, Message]), ChatUserModule, forwardRef(() => UsersModule)],
  controllers: [ChatController],
  providers: [ChatService, MessageService],
  exports: [ChatService, MessageService]
})
export class ChatModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, AuthenticMiddleware, ConnectedMiddleware)
        .forRoutes(ChatController)
  }
}
