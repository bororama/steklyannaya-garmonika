import { Module, forwardRef } from '@nestjs/common';
import { MetaverseGateway } from './metaverse.gateway';
import { MetaverseController } from './metaverse.controller';
import { UsersModule } from '../users/users.module'
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [MetaverseGateway],
  controllers: [MetaverseController],
  imports: [ConfigModule, forwardRef(() => UsersModule)],
  exports: [MetaverseGateway]
})
export class MetaverseModule {}
