import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Chat } from '../chat/models/chat.model';
import { User } from '../users/models/user.model';
import { ChatUsers } from './models/chatUsers.model';
import { ChatBans } from './models/chatBan.model';

@Module({
    imports: [SequelizeModule.forFeature([Chat, User, ChatUsers, ChatBans])],
    exports: [SequelizeModule]
})
export class ChatUserModule {}
