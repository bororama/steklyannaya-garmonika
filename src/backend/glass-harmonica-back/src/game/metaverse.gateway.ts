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
import { ServerToClientEvents, ClientToServerEvents, Message, Player, User } from "../components/shared/meta.interface"


const livePlayers : Array<Player> = Array();

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

  
  @SubscribeMessage('userData')
  async onUserDataMessage(@MessageBody() payload: string, @ConnectedSocket() Socket : Socket): Promise<String> {
    
    const newUser : User = { locator: livePlayers.length, name : payload };
    const newPlayer : Player = { user : newUser, position : [0,0,0], state : 0};
    livePlayers.push(newPlayer);

    Socket.emit('welcomePack', {newPlayer, livePlayers}); // previously spawned player list should be sent aswell
    Socket.broadcast.emit('newPlayer', newPlayer);
    return `You sent : userData ${ payload }`;
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