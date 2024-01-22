import { GameElement } from "./GameElement";
import { BackendConfig } from "./BackendConfig";

export class Ball implements GameElement {
  posx: number;
  posy: number;
  sizex: number;
  angularSpeed: number;
  speed: number;
  directionx = 3;
  directiony = 1;
  config: BackendConfig;
  
  goalRedraw() {
    this.directionx = 3;
    this.directiony = 1;
    if (Math.round(Math.random()) == 1) this.directionx = -this.directionx;
    if (Math.round(Math.random()) == 1) this.directiony = -this.directiony;
    this.posx = this.config.centerX - this.config.ballSize / 2;
    this.posy = this.config.centerY;
    this.speed = 0;
    setTimeout(() => {
      this.speed = this.config.ballSpeed;
    }, 1000);
  }

  wallReflection() {
    //console.log(this.directiony, this.posx, this.posy);
    this.directiony = -this.directiony;
  }

  constructor(
    x: number,
    y: number,
    ballSize: number,
    config: BackendConfig
  ) {
    this.posx = x;
    this.posy = y;
    this.sizex = ballSize;
    this.config = config;
    this.speed = this.config.ballSpeed;
    this.angularSpeed = 0;
  }
}
