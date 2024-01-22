import { Controller, Get, Req, Res } from '@nestjs/common';
import { PongService } from './pong.service';

// pong.controller.ts
import { Server } from 'socket.io';

@Controller('pong')
export class PongController {
  constructor(private readonly pongServerService: PongService) {}

  @Get()
  getPong(@Req() req, @Res() res) {
    return res.send('NestJS Peng server running!');
  }
}
