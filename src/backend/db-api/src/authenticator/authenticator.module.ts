import { Module } from '@nestjs/common';
import { AuthenticatorController } from './authenticator.controller';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [AuthenticatorController],
  imports: [UsersModule]
})

export class AuthenticatorModule {}
