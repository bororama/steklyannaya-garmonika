import { Module } from '@nestjs/common';
import { PongController } from './pong.controller';
import { PongService } from './pong.service';
import { MatchesModule } from '../matches/matches.module'

// pong.module.ts
import { PongGateway } from './pong.gateway'; // Asumiendo que creas un AppGateway

@Module({
  controllers: [PongController],
  providers: [PongService, PongGateway],
  imports: [MatchesModule]
})
export class PongModule {}
