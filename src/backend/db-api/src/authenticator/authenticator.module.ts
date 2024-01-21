import { Module } from '@nestjs/common';
import { AuthenticatorController } from './authenticator.controller';
import { UsersModule } from '../users/users.module';
import { AdminsModule } from 'src/admins/admins.module';

@Module({
  controllers: [AuthenticatorController],
  imports: [UsersModule, AdminsModule]
})

export class AuthenticatorModule {}
