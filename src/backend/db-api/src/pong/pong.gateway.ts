// app.gateway.ts
import { Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PongService } from './pong.service';

@WebSocketGateway({ namespace: '/pong', cors: true })
@Injectable()
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly pongServerService: PongService) {}

  afterInit(server: Server) {
    this.pongServerService.initSocket(server);
    console.log('Socket.IO initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
