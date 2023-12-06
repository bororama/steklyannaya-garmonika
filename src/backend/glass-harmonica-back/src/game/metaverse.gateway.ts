import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Logger } from "@nestjs/common";
import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, Message } from "../shared/meta.interface"



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
  async handleEvent(@MessageBody() payload: Message): Promise<String> {

    this.server.emit('chat', payload ,(e)=> {
      console.log("where's this e going? : ", e);
    });
    return `You sent : ${ payload }`;
  }
}