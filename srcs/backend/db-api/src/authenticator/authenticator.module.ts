import { Module } from '@nestjs/common';
import { AuthenticatorController } from './authenticator.controller';
import { UsersModule } from '../users/users.module';
import { AdminsModule } from 'src/admins/admins.module';
import { BansModule } from 'src/bans/bans.module';
import { ConfigModule } from '@nestjs/config';
import { FtOauthService } from './ftOAuthService';
import { AuthenticatorService } from './authenticator.service';

@Module({
  controllers: [AuthenticatorController],
  imports: [UsersModule, AdminsModule, BansModule, ConfigModule],
  providers: [FtOauthService, AuthenticatorService]
})

export class AuthenticatorModule {}
