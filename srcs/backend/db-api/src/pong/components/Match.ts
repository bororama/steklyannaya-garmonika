// GameState.ts
import { Ball } from './Ball';
import { Score } from './Score';
import { Paddle } from './Paddle';
import { BackendConfig } from './BackendConfig';
import { CollisionController } from './CollisionController';
import { Server } from 'socket.io';
import { MatchesService } from '../../matches/matches.service'

export enum Constants {
  MATCH_FAILED = -1,
  MATCH_NOT_IN_PROGRESS = 0,
  MATCH_IN_PROGRESS = 1,
  MATCH_ENDED = 2
}

export class Match {
  config: BackendConfig;
  paddles: Paddle[];
  ball: Ball;
  scores: Score[];
  canvasDimensions: { width: number; height: number };
  collisionController: CollisionController;
  isGameInProgress : number;
  matchIndex: number;
  pongRoomId: number;
  provisionalRoomId: number;

  constructor(width: number, height: number, mode: number, private matchesService: MatchesService) {
    this.config = new BackendConfig(width, height);
    this.paddles = [];
    this.scores = [new Score(width / 4, width / 12, 'white'), new Score((width / 4) * 3, width / 12, 'white')];
    this.canvasDimensions = { width, height };
    this.isGameInProgress = Constants.MATCH_NOT_IN_PROGRESS;
    this.matchIndex = -1;
    this.pongRoomId = -10;
    this.ball = new Ball(
      this.config.centerX - this.config.ballSize / 2,
      this.config.centerY - this.config.ballSize / 2,
      this.config.ballSize,
      this.config
    );
    this.collisionController = new CollisionController(this.ball, this.paddles, this.config, mode);
  }

  recordOnDB(){
    try {
        if (this.scores[0].score > this.scores[1].score)
        {
          console.log("WINS PLAYER 1")
            this.matchesService.finishMatchByRoom(this.pongRoomId, 'player1', this.scores[0].score, this.scores[1].score)
            console.log("player 1 wins.");
        }
        else
        {
          console.log("WINS PLAYER 2")
            this.matchesService.finishMatchByRoom(this.pongRoomId, 'player2', this.scores[0].score, this.scores[1].score)
            console.log("player 2 wins.");
        }
    } catch (e) {
        console.error(e.message);
    }
  };

  maxScoreAchieved(){
    return (this.scores[0].score >= this.config.pointsToWin || this.scores[1].score >= this.config.pointsToWin);
  }

  startGameLoop(io: Server) {
    if (this.isGameInProgress === Constants.MATCH_IN_PROGRESS) {
      this.matchesService.startMatchByRoom(this.pongRoomId)
      this.gameLoop(io);
    }
  }

  async createMatchInDB(payload: any) {
    if (this.pongRoomId == -2) {
      let dbMatch = await this.matchesService.createMatch(payload.username)
      this.provisionalRoomId = dbMatch.roomId
      console.log(this.provisionalRoomId)
    }
  }

  private gameLoop(io: Server) {
    this.paddles.forEach((paddle: Paddle) => paddle.update(this.config));
    this.collisionController.checkCollisions(this.config);

    if (this.ball.posx < 0) {
      this.scores[1].score++;
      this.ball.goalRedraw();
    } else if (this.ball.posx > this.config.canvasWidth - this.ball.sizex) {
      this.scores[0].score++;
      this.ball.goalRedraw();
    }

    io.to(this.matchIndex.toString()).emit('updateGameState', this);

    if (this.maxScoreAchieved()) {
      console.log('Match ended.', this.config.pointsToWin);
      this.isGameInProgress = Constants.MATCH_ENDED;
      io.to(this.matchIndex.toString()).emit('updateGameState', this);
      this.recordOnDB();
      return;
    }
    if (this.isGameInProgress === Constants.MATCH_IN_PROGRESS) {
      setTimeout(() => this.gameLoop(io), 1000 / 60); // FPS
    }
  }

  assignPaddleToPlayer(playerId: string) {
    if (this.paddles.length === 0) {
      const paddle1 = new Paddle(
        this.config.canvasWidth / 12,
        this.config.canvasHeight / 2 - (this.config.canvasWidth / 12) / 2,
        this.config.paddle1Height,
        this.config.paddle1Width,
        this.ball,
        playerId
      );
      this.paddles.push(paddle1);
    } else if (this.paddles.length === 1) {
      const paddle2 = new Paddle(
        this.config.canvasWidth - this.paddles[0].posx - this.paddles[0].sizex,
        this.config.canvasHeight / 2 - (this.config.canvasWidth / 12) / 2,
        this.config.paddle2Height,
        this.config.paddle2Width,
        this.ball,
        playerId
      );
      this.paddles.push(paddle2);
      }
    }
  }
