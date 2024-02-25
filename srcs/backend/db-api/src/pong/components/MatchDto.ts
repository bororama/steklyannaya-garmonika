import { Ball } from './Ball';
import { Score } from './Score';
import { Paddle } from './Paddle';
import { BackendConfig } from './BackendConfig';
import { CollisionController } from './CollisionController';
import { Server } from 'socket.io';
import { MatchesService } from '../../matches/matches.service'
import { Match } from './Match';

export class MatchDto {
    paddles: Paddle[];
    ball: Ball;
    scores: Score[];
    isGameInProgress : number;
    matchIndex: number;

    constructor (match: Match) {
        this.paddles = match.paddles;
        this.ball = match.ball;
        this.scores = match.scores;
        this.isGameInProgress = match.isGameInProgress;
        this.matchIndex = match.matchIndex;
    }
}
