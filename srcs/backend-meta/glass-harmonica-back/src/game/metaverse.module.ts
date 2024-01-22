import { Module } from '@nestjs/common';
import { MetaverseGateway } from './metaverse.gateway';

@Module({
  providers: [MetaverseGateway],
})
export class MetaverseModule {}