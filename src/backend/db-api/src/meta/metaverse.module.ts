import { Module } from '@nestjs/common';
import { MetaverseGateway } from './metaverse.gateway';
import { MetaverseController } from './metaverse.controller';

@Module({
  providers: [MetaverseGateway],
  controllers: [MetaverseController]
})
export class MetaverseModule {}