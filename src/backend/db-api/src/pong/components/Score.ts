export class Score {
  score: number;
  posx: number;
  posy: number;

  colour: string;

  constructor(posx: number, posy: number, colour: string) {
    this.posx = posx;
    this.posy = posy;
    this.colour = colour;
    this.score = 0;
  }
}
