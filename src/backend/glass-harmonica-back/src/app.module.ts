import { Module } from '@nestjs/common';
import { MetaverseController } from './game/metaverse.controller';
import { MetaverseModule } from './game/metaverse.module';

@Module({
  imports: [MetaverseModule],
  controllers: [MetaverseController],
  providers: [],
})
export class AppModule {}
