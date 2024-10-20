import { Module, forwardRef, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ChatController } from './chat.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Chat } from './models/chat.model';
import { ChatUserModule } from '../chat-user/chat-user.module';
import { UsersModule } from '../users/users.module';
import { MessageService } from './services/message.service';
import { Message } from './models/message.model';
import { AuthMiddleware } from '../middleware/auth-middleware';
import { AuthenticMiddleware } from '../middleware/authenticity-middleware';
import { ConnectedMiddleware } from '../middleware/connected-middleware';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [SequelizeModule.forFeature([Chat, Message]), ChatUserModule, forwardRef(() => UsersModule), ConfigModule],
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
