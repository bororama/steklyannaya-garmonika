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
import { ServerToClientEvents, ClientToServerEvents, Message, Player, LiveClient, User } from "./shared/meta.interface"
import { UsersService } from '../users/services/users.service';

const liveClients : Array<LiveClient> = Array();
let clientLocator : number = 0;

@WebSocketGateway(777,{
  cors: {
    origin: '*',
  },
})


export class MetaverseGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  
  private logger : Logger = new Logger("MetaverseGateway");

  constructor (private usersService : UsersService) {}


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
    this.usersService.setOnlineStatus(liveClients[i].player.user.name, false)
    liveClients.splice(i, 1);
    this.server.emit('playerLeft', disconnectedPlayer);
  }

  @SubscribeMessage('reconnect')
  async onReconnect(): Promise<String> {
    console.log("recconecting fired");
    return `reconnecting`;
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
    let i = 0;
    console.log("--------");
    for (let p of liveClients) {
      console.log(i, "] p of livePlayers : ", p.player, " id : ", p.socket.id);
      i++;
    }
    console.log("--------");
    const livePlayers = liveClients.map((c: LiveClient) => {
      return c.player;
		});
    socket.emit('welcomePack', {newPlayer, livePlayers});
    socket.broadcast.emit('newPlayer', {retries : 0, player : newPlayer});

    this.usersService.setOnlineStatus(payload, true);

    return `You sent : userData ${ payload }`;
  }
  
  @SubscribeMessage('chat')
  async onChatMessage(@MessageBody() payload: Message, @ConnectedSocket() socket : Socket): Promise<String> {

    socket.broadcast.emit('chat', payload);
    return `You sent : chat ${ payload }`;
  }

  @SubscribeMessage('playerUpdate')
  async onPlayerUpdateMessage(@MessageBody() payload: Player, @ConnectedSocket() socket : Socket): Promise<String> {

    socket.broadcast.emit('playerUpdate', payload);
    return `You sent : playerUpdate ${ payload }`;
  }

  @SubscribeMessage('spawnNewPlayerFailed')
  async onSpawnNewPlayerFailed(@MessageBody() payload : {retries : number, player : null | Player}, @ConnectedSocket() socket : Socket): Promise<String> {
    setTimeout(() => { 
      if (payload.player) {
        socket.emit('newPlayer',{retries : payload.retries + 1, player : payload.player});
      }
    }, 300 + (Math.pow(payload.retries, 2) * 100));
    return `No. of retries :  ${ payload.retries }`;
  }

  @SubscribeMessage('spawnExistingPlayersFailed')
  async onSpawnExistingPlayersFailed(@MessageBody() payload : string , @ConnectedSocket() socket : Socket) {
    const livePlayers = liveClients.map((c: LiveClient) => {
      return c.player;
    });
    console.log(payload);
    console.table(livePlayers);
    return livePlayers;
  }

  @SubscribeMessage('PingPong')
  async onPingPong(@MessageBody() payload : string , @ConnectedSocket() socket : Socket) {
    console.log("PingPong received ", payload);
    socket.emit('gameStart');
    socket.broadcast.emit('apotheosis', payload);
  }

  @SubscribeMessage('endDummyGame')
  async onEndDummyGame(@MessageBody() payload : string , @ConnectedSocket() socket : Socket) {
    socket.emit('gameEnd');
    socket.broadcast.emit('stopApotheosis', payload);
  }


}

