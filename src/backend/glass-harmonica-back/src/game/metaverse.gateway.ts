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
    console.log(" New connecting client id  : ", client.id);
    liveClients.push(newLiveClient);
  }
    
  handleDisconnect(client: Socket) {
    console.log("connection end");
    const i : number = liveClients.findIndex((c) => { return c.socket === client})
    const disconnectedPlayer : Player = liveClients[i].player;
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
    socket.broadcast.emit('newPlayer', {retries : 0, Player : newPlayer});
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

  @SubscribeMessage('spawnFailed')
  async onSpawnFailed(@MessageBody() payload : {retries : number, problemPlayer : null | Player}, @ConnectedSocket() socket : Socket): Promise<String> {
    console.log(`spawnFailed :  No. of retries :  ${ payload.retries }`);
    setTimeout(() => { 
      console.log("I would try again here....");
      if (payload.problemPlayer) {
        socket.broadcast.emit('newPlayer', payload.problemPlayer);
      }
      else {        
        liveClients.forEach((c) => {
          socket.broadcast.emit('newPlayer', c);
        });
      }
    }, 100 + (Math.pow(payload.retries, 2) * 100));
    return `No. of retries :  ${ payload.retries }`;
  }
}