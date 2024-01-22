export class FrontendConfig {
  BACKGROUND_COLOUR: string;
  ELEMENT_COLOUR: string;
  paddle1Colour: string;
  paddle2Colour: string;

  constructor(width: number, height: number) {
    //datos por defecto:
    this.BACKGROUND_COLOUR = "black";
    this.ELEMENT_COLOUR = "white";
    this.paddle1Colour = this.ELEMENT_COLOUR;
    this.paddle2Colour = this.ELEMENT_COLOUR;
  }
}
