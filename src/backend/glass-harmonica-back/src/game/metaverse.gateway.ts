import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket
} from '@nestjs/websockets';
import { Logger } from "@nestjs/common";
import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, Message, type Player } from "../shared/meta.interface"



@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MetaverseGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  
  private logger : Logger = new Logger("MetaverseGateway");


  @WebSocketServer()
  server: Server = new Server<ServerToClientEvents, ClientToServerEvents>();

  afterInit(server: Server) {
      this.logger.log("MetaverseGateway initialized");
  }

  handleConnection(client: any, ...args: any[]) {
      console.log("connection start");
    }
    
    handleDisconnect(client: Socket) {
    console.log("connection end");
  }
  
  @SubscribeMessage('chat')
  async onChatMessage(@MessageBody() payload: Message, @ConnectedSocket() Socket : Socket): Promise<String> {

    Socket.broadcast.emit('chat', payload);
    return `You sent : chat ${ payload }`;
  }

  @SubscribeMessage('playerUpdate')
  async onPlayerUpdateMessage(@MessageBody() payload: Player, @ConnectedSocket() Socket : Socket): Promise<String> {

    Socket.broadcast.emit('playerUpdate', payload);
    return `You sent : playerUpdate ${ payload }`;
  }
}