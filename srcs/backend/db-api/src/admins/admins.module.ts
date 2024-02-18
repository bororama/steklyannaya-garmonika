import { MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { UsersModule } from '../users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from './admin.model';
import { Ban } from '../bans/ban.model';
import { BansModule } from '../bans/bans.module';
import { ChatModule } from '../chat/chat.module';
import { AdminMiddleware } from '../middleware/admin-middleware';
import { AuthMiddleware } from '../middleware/auth-middleware';
import { ConfigModule } from '@nestjs/config';
import { MetaverseModule } from '../meta/metaverse.module';
import { AuthenticMiddleware } from '../middleware/authenticity-middleware';

@Module({
  imports: [SequelizeModule.forFeature([Admin, Ban]), forwardRef(() => UsersModule), BansModule, ChatModule, ConfigModule, forwardRef(() => MetaverseModule)],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService]
})
export class AdminsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
     consumer
       .apply(AuthMiddleware, AuthenticMiddleware, AdminMiddleware)
       .forRoutes(AdminsController);
  }
}
