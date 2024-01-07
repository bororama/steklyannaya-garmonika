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
import { ServerToClientEvents, ClientToServerEvents, Message, Player, LiveClient, User } from "../components/shared/meta.interface"

const liveClients : Array<LiveClient> = Array();
let clientLocator : number = 0;

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

  handleConnection(client: any) {
    let newLiveClient : LiveClient = { socket : client, player : null };
    liveClients.push(newLiveClient);
  }
    
  handleDisconnect(client: Socket) {
    console.log("connection end");
    const i : number = liveClients.findIndex((c) => { return c.socket === client})
    const disconnectedPlayer : Player = liveClients[i].player;
    liveClients.splice(i, 1);
    this.server.emit('playerLeft', disconnectedPlayer);
  }

  @SubscribeMessage('userData')
  async onUserDataMessage(@MessageBody() payload: string, @ConnectedSocket() socket : Socket): Promise<String> {
    
    const clientIndex = liveClients.findIndex((p) => {
       return p.socket === socket;
    });
    const newUser : User = { locator: clientLocator, name : payload };
    clientLocator++;
    const newPlayer : Player = { user : newUser, position : [0,0,0], rotation : [0,0,0,1.0], state : 0};
    liveClients[clientIndex].player = newPlayer;
    for (let p of liveClients) {
      console.log("p of liveplayers : ", p.player);
    }
    const livePlayers = liveClients.map((c: LiveClient) => {
      return c.player;
		});
    socket.emit('welcomePack', {newPlayer, livePlayers});
    socket.broadcast.emit('newPlayer', newPlayer);
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