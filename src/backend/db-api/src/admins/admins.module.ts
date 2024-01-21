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

@Module({
  imports: [SequelizeModule.forFeature([Admin, Ban]), forwardRef(() => UsersModule), BansModule, ChatModule, ConfigModule],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService]
})
export class AdminsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
//      consumer
//        .apply(AuthMiddleware, AdminMiddleware)
//        .forRoutes(AdminsController);
  }
}
