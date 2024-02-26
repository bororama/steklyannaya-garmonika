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
import { Logger, BadRequestException } from "@nestjs/common";
import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, Message, Player, LiveClient, User } from "./shared/meta.interface"
import { User as UserModel } from 'src/users/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { UserStatus } from 'src/users/dto/user-status.enum';
import { ConfigService } from '@nestjs/config';

const liveClients : Array<LiveClient> = Array();
const configService = new ConfigService;
const host: string = configService.get('HOST').toLowerCase();
const port: string = configService.get('FRONTEND_PORT');

@WebSocketGateway(777, {
  cors: {
    'origin': ['http://' + host + (+port != 80 ? ':' + port : '')],
    'methods': 'GET,POST,DELETE',
    'preflightContinue': false,
    'credentials': false,
  },
})


export class MetaverseGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  private logger: Logger = new Logger("MetaverseGateway");

  constructor(
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
  ) { }


  @WebSocketServer()
  server: Server = new Server<ServerToClientEvents, ClientToServerEvents>();

  afterInit(server: Server) {
    this.logger.log("MetaverseGateway initialized");
  }

  handleConnection(client: any) {
    let newLiveClient: LiveClient = { socket: client, player: null };
    liveClients.push(newLiveClient);
  }

  async handleDisconnect(client: Socket) {
    try {
      const i: number = liveClients.findIndex((c) => { return c.socket === client })
      const disconnectedPlayer: Player = liveClients[i].player;
      await this.setOnlineStatus(liveClients[i].player.user.id, false)
      liveClients.splice(i, 1);
      this.server.emit('playerLeft', disconnectedPlayer);
    }

    catch (error) {
      console.error(error);
    }
  }

  @SubscribeMessage('reconnect')
  async onReconnect(): Promise<String> {
    return `reconnecting`;
  }

  @SubscribeMessage('userData')
  async onUserDataMessage(@MessageBody() payload: User, @ConnectedSocket() socket: Socket): Promise<String> {

    try {

      await this.setOnlineStatus(payload.id, true);
      const clientIndex = liveClients.findIndex((p) => {
        return p.socket === socket;
      });
  
      const newUser: User = { id: payload.id, name: payload.name };
      const newPlayer: Player = { user: newUser, position: [0, 0, 0], rotation: [0, 0, 0, 1.0], state: 0 };
      liveClients[clientIndex].player = newPlayer;
      const livePlayers = liveClients.map((c: LiveClient) => {
        return c.player;
      });
      socket.emit('welcomePack', { newPlayer, livePlayers });
      socket.broadcast.emit('newPlayer', { retries: 0, player: newPlayer });
    }

    catch  (error) {
      this.logger.warn(error);
      socket.emit('alreadyJoined');
    }

    return `You sent : userData ${payload}`;
  }

  @SubscribeMessage('chat')
  async onChatMessage(@MessageBody() payload: Message, @ConnectedSocket() socket: Socket): Promise<String> {

    socket.broadcast.emit('chat', payload);
    return `You sent : chat ${payload}`;
  }

  @SubscribeMessage('playerUpdate')
  async onPlayerUpdateMessage(@MessageBody() payload: Player, @ConnectedSocket() socket: Socket): Promise<String> {

    socket.broadcast.emit('playerUpdate', payload);
    return `You sent : playerUpdate ${payload}`;
  }

  @SubscribeMessage('spawnNewPlayerFailed')
  async onSpawnNewPlayerFailed(@MessageBody() payload: { retries: number, player: null | Player }, @ConnectedSocket() socket: Socket): Promise<String> {
    setTimeout(() => {
      if (payload.player) {
        socket.emit('newPlayer', { retries: payload.retries + 1, player: payload.player });
      }
    }, 300 + (Math.pow(payload.retries, 2) * 100));
    return `No. of retries :  ${payload.retries}`;
  }

  @SubscribeMessage('spawnExistingPlayersFailed')
  async onSpawnExistingPlayersFailed(@MessageBody() payload: string, @ConnectedSocket() socket: Socket) {
    const livePlayers = liveClients.map((c: LiveClient) => {
      return c.player;
    });
    console.log(payload);
    console.table(livePlayers);
    return livePlayers;
  }

  @SubscribeMessage('PingPong')
  async onPingPong(@MessageBody() payload: string, @ConnectedSocket() socket: Socket) {
    console.log("PingPong received ", payload);
    socket.emit('gameStart');
    socket.broadcast.emit('apotheosis', payload);
  }

  @SubscribeMessage('endDummyGame')
  async onEndDummyGame(@MessageBody() payload: string, @ConnectedSocket() socket: Socket) {
    socket.emit('gameEnd');
    socket.broadcast.emit('stopApotheosis', payload);
  }


  kickFromMetaverse(id: string) {
    const bannedClient = liveClients.find((c) => {
      return c.player.user.id === id;
    });
    console.log("KICKING ", bannedClient);
    if (bannedClient) {
      bannedClient.socket.emit('banned');
      bannedClient.socket.disconnect();
    }
  }

  changeName(id: string, newName: string) {
    const client = liveClients.find((c) => {
      return c.player.user.id === id;
    });
    console.log("changing name ", client, "username? ", id);
    if (client) {
      this.server.emit('name', { id: id, newName: newName });
    }
  }

  blockUser(userId : string, blockedUserId : string) {
    const client = liveClients.find((c) => {
      return c.player.user.id === userId;
    });
    if (client) {
      client.socket.emit('blockUser', {blockedUserId : blockedUserId});
    }
  }

  unblockUser(userId : string, blockedUserId : string) {
    const client = liveClients.find((c) => {
      return c.player.user.id === userId;
    });
    if (client) {
      client.socket.emit('unblockUser', {blockedUserId : blockedUserId});
    }
  }

  async setOnlineStatus(userId: string, status: boolean): Promise<void> {
    const searchCondition = isNaN(+userId)
      ? { userName: userId }
      : { id: +userId };
    const user = await this.userModel.findOne({
      where: searchCondition
    });
    if (user) {
      if (user.status === UserStatus.online && status === true)
        throw new BadRequestException("User is already online");
      user.status = (status ? UserStatus.online : UserStatus.offline);
      user.save();
    }
  }
}

