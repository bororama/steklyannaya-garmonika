import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Match } from './components/Match';
import { Match as MatchModel } from '../matches/models/match.model';
import { MatchesService } from '../matches/matches.service'
import { Constants } from './components/Match';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PongService {
  private readonly jwt_log_secret : string = this.configService.get('JWT_LOG_SECRET');
  private matches: Match[] = [];
  private connectedUsers: { [socketId: string]: { match: Match; paddleIndex: number } } = {};
  
  constructor(
    private readonly matchesService: MatchesService,
    private readonly configService: ConfigService
    ) {}
  private connectionConditions(existingMatch, data: any){
    if (data.pongRoomId === -2){
      console.log("public match ", existingMatch, data);
      return(              
        existingMatch.paddles.length === 1 &&
        existingMatch.isGameInProgress !== Constants.MATCH_FAILED &&
        existingMatch.isGameInProgress !== Constants.MATCH_ENDED &&
        existingMatch.collisionController.mode === data.mode) &&
        existingMatch.pongRoomId === -2;
    }
    else{
      console.log("private match");
      return(
        existingMatch.isGameInProgress !== Constants.MATCH_FAILED &&
        existingMatch.isGameInProgress !== Constants.MATCH_ENDED &&
        existingMatch.pongRoomId === data.pongRoomId
      );
    }
  }

  private async verifyPlayer(playerId: string, roomId: string): Promise<boolean> {
    const numericRoomId: number = +roomId;
    const numericPlayerId: number = +playerId;
    if (numericRoomId == -2)
      return true;
    if (Number.isNaN(numericRoomId) || Number.isNaN(numericPlayerId)) {
      return false
    }
    const match: MatchModel = await this.matchesService.getByRoomId(numericRoomId);
    return numericPlayerId == match.idPlayer1 || numericPlayerId == match.idPlayer2;
  }

  public initSocket(io: Server): void {
    io.on('connection', (socket: Socket) => {
      const playerId = socket.id;
      socket.on('beginGame', (data) => {
          let payload : any;
          console.log(data)
          console.log(data.token)

          try {
            payload = jwt.verify(data.token, this.jwt_log_secret);
          } catch (e) {
            socket.disconnect(false);
          }
          console.log(payload);

          if (!this.verifyPlayer(payload.username, data.pongRoomId)) {
            socket.disconnect(false);
          }

          let match: Match | undefined;
          console.log(data.pongRoomId + " received pongRoomId"); // TODO Revisar iteracion matches
          for (const existingMatch of this.matches) {
            if (this.connectionConditions(existingMatch, data)) {
              console.log('Existing match found.');
              match = existingMatch;
              if (match.pongRoomId == -2)
              {
                console.log("SECOND PLAYER")
                console.log(match.provisionalRoomId)
                console.log(payload.username)
                this.matchesService.joinMatch(payload.username, match.provisionalRoomId)
                match.pongRoomId = match.provisionalRoomId
              }
              socket.join(existingMatch.matchIndex.toString());
              break;
            }
          }
          if (!match) {
            console.log('Incomplete match not found. Creating a new match...');
            match = new Match(1000, 1000 / 2, data.mode, this.matchesService); // 0 = modo normal, 1 = modo sin paredes
            this.matches.push(match);
            match.matchIndex = this.matches.indexOf(match); 
            socket.join(match.matchIndex.toString());
            match.pongRoomId = data.pongRoomId;
            console.log("FIRST PLAYER")
            match.createMatchInDB(payload);
          }

          const paddleIndex = match.paddles.length;
          this.connectedUsers[playerId] = { match, paddleIndex };
          socket.emit('matchInfo', {
            matchIndex: this.matches.indexOf(match),
            pongRoomId: match.pongRoomId,
            paddleIndex,
          });       
          match.assignPaddleToPlayer(playerId);        
          io.to(match.matchIndex.toString()).emit('updateGameState', match);        
          if (match.paddles.length >= 2 && match.isGameInProgress === Constants.MATCH_NOT_IN_PROGRESS) {
            console.log('Starting a new match between ', match.paddles[0].playerId, ' and ', match.paddles[1].playerId);
            match.isGameInProgress = Constants.MATCH_IN_PROGRESS;
            setTimeout(() => {
              match.startGameLoop(io);
            }, 2000);
          }
      });

      socket.on('movePaddle', (data) => {
        const user = this.connectedUsers[playerId];
        if (user) {
          const paddle = user.match.paddles[user.paddleIndex];
          if (paddle) {
            paddle.direction = data.direction === 'stop' ? 999 : data.direction === 'up' ? -user.match.config.paddleSpeed: user.match.config.paddleSpeed;
          }
          io.to(user.match.matchIndex.toString()).emit('updateGameState', user.match);
        }
      });

      socket.on('disconnect', () => {
        const user = this.connectedUsers[playerId];
        if (user) {
          const { match, paddleIndex } = user;
          delete this.connectedUsers[playerId];
          socket.leave(match.matchIndex.toString());
          const paddle = match.paddles[paddleIndex];
          if (paddle) {
            const paddleIndex = match.paddles.findIndex((p) => p.playerId === playerId);
            match.paddles.splice(paddleIndex, 1);
          }
          if (match.paddles.length === 0) {
            const matchIndex = this.matches.indexOf(match);
            console.log(matchIndex, "MATCHINDEXXXXXX")
            if (match.isGameInProgress === Constants.MATCH_NOT_IN_PROGRESS){
              console.log('Game never started. Deleting from DB', match.provisionalRoomId);
              console.log('This is matchesService info:', this.matchesService)
              console.log(match);
              if (match.pongRoomId == -2)
                this.matchesService.delete(match.provisionalRoomId);
              else
              this.matchesService.delete(match.pongRoomId);
            }
            if (matchIndex !== -1) {
              this.matches.splice(matchIndex, 1);
              console.log('Match removed from matches array.');
            }
          }
          if (match.isGameInProgress === Constants.MATCH_IN_PROGRESS && match.paddles.length < 2) {
            console.log('Less than two players connected. Stopping the game ', match.matchIndex);
            this.matchesService.delete(match.pongRoomId);
            match.isGameInProgress = Constants.MATCH_FAILED;
            io.to(match.matchIndex.toString()).emit('updateGameState', match);
          }
        }
      });
    });
  }
}
