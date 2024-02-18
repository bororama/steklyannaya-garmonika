import { Module } from '@nestjs/common';
import { AuthenticatorController } from './authenticator.controller';
import { UsersModule } from '../users/users.module';
import { AdminsModule } from '../admins/admins.module';
import { BansModule } from '../bans/bans.module';
import { ConfigModule } from '@nestjs/config';
import { FtOauthService } from './ftOAuthService';
import { AuthenticatorService } from './authenticator.service';

@Module({
  controllers: [AuthenticatorController],
  imports: [UsersModule, AdminsModule, BansModule, ConfigModule],
  providers: [FtOauthService, AuthenticatorService]
})

export class AuthenticatorModule {}
