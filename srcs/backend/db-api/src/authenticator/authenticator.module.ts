import { Module } from '@nestjs/common';
import { AuthenticatorController } from './authenticator.controller';
import { UsersModule } from '../users/users.module';
import { AdminsModule } from 'src/admins/admins.module';
import { BansModule } from 'src/bans/bans.module';

@Module({
  controllers: [AuthenticatorController],
  imports: [UsersModule, AdminsModule, BansModule]
})

export class AuthenticatorModule {}
