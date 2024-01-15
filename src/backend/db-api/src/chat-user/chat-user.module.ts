import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Chat } from '../chat/models/chat.model';
import { User } from '../users/models/user.model';
import { ChatUsers } from './models/chatUsers.model';

@Module({
    imports: [SequelizeModule.forFeature([Chat, User, ChatUsers])],
    exports: [SequelizeModule]
})
export class ChatUserModule {}
