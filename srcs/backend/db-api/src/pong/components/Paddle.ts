import { Ball } from "./Ball";
import { GameElement } from "./GameElement";
import { BackendConfig } from "./BackendConfig";

export class Paddle implements GameElement {
  posx: number;
  posy: number;

  sizex: number;
  sizey: number;
  playerId: string;

  speed = 2;
  direction: number;

  constructor(
    posx: number,
    posy: number,
    sizex: number,
    sizey: number,
    public ball: Ball,
    playerId: string,
  ) {
    this.posx = posx;
    this.posy = posy;
    this.sizex = sizex;
    this.sizey = sizey;
    this.direction = 999;
    this.playerId = playerId;
  }

  update(config: BackendConfig) {
    if (this.direction !== 999) {
      this.posy += this.direction * this.speed;
    }
    let lowerbound = config.canvasHeight - this.sizey;
    //console.log(this.sizey, "sizey", lowerbound, "lowerbound");
    if (this.posy < 0) {
        this.posy = 0;
    } else if (this.posy >= lowerbound) {
        this.posy = lowerbound;
    }
  }
}
