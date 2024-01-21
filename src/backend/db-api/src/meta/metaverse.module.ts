import { Module } from '@nestjs/common';
import { MetaverseGateway } from './metaverse.gateway';
import { MetaverseController } from './metaverse.controller';
import { UsersModule } from '../users/users.module'

@Module({
  providers: [MetaverseGateway],
  controllers: [MetaverseController],
  imports: [UsersModule],
  exports: [MetaverseGateway]
})
export class MetaverseModule {}
