export class BackendConfig {
  centerX: number;
  centerY: number;
  paddle1Height: number;
  paddle1Width: number;
  paddle2Height: number;
  paddle2Width: number;
  ballSize: number;
  ballSpeed: number;
  ballTopSpeed: number;
  paddleSpeed: number;
  pointsToWin: number;
  canvasWidth: number;
  canvasHeight: number;

  constructor(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.ballSize = width / 60;
    this.paddle1Width = width / 12;
    this.paddle2Width = this.paddle1Width;
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.paddle1Height = height / 50;
    this.paddle2Height = this.paddle1Height;
    this.ballSpeed = 2;
    this.ballTopSpeed = 4;
    this.paddleSpeed = 3;
    this.pointsToWin = 7;
  }
}
