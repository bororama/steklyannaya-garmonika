import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { ChatController } from './chat.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Chat } from './models/chat.model';
import { ChatUserModule } from '../chat-user/chat-user.module';
import { UsersModule } from '../users/users.module';
import { MessageService } from './services/message.service';
import { Message } from './models/message.model';

@Module({
  imports: [SequelizeModule.forFeature([Chat, Message]), ChatUserModule, forwardRef(() => UsersModule)],
  controllers: [ChatController],
  providers: [ChatService, MessageService],
  exports: [ChatService, MessageService]
})
export class ChatModule {}
