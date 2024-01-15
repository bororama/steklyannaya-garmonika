import { Module, ValidationPipe, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { Player } from './models/player.model';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/user.controller';
import { PlayersController } from './controllers/players.controller';
import { PlayersService } from './services/players.service';
import { ChatUserModule } from '../chat-user/chat-user.module';
import { Block } from './models/block.model';
import { Friendship } from './models/friendship.model';
import { APP_PIPE } from '@nestjs/core';
import { BansModule } from '../bans/bans.module';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [SequelizeModule.forFeature([User, Player, Block, Friendship]), ChatUserModule, BansModule, ConfigModule, forwardRef(() => ChatModule)],
  providers: [UsersService, PlayersService, { provide: APP_PIPE, useClass: ValidationPipe }],
  controllers: [UsersController, PlayersController],
  exports: [UsersService, PlayersService]
})
export class UsersModule {}
