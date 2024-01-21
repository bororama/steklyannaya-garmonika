import { Ball } from "./Ball";
import { Paddle } from "./Paddle";
import { BackendConfig } from "./BackendConfig";

export class CollisionController {
  ball: Ball;
  paddles: Paddle[];
  config: BackendConfig;
  mode: number;
  constructor(ball: Ball, paddles: Paddle[], config: BackendConfig, mode: number) {
    this.ball = ball;
    this.paddles = paddles;
    this.config = config;
    this.mode = mode;
  }
  private ballMoves(){
    this.ball.posx += this.ball.directionx * this.ball.speed;
    this.ball.posy += this.ball.directiony * this.ball.speed;
  }
  private ballImpactsPaddle(paddle: Paddle){
    return(this.ball.posx + this.ball.sizex >= paddle.posx &&
      this.ball.posx <= paddle.posx + paddle.sizex &&
      this.ball.posy + this.ball.sizex >= paddle.posy &&
      this.ball.posy <= paddle.posy + paddle.sizey)
  }
  checkCollisions(config: BackendConfig) {
    this.ballMoves();
    this.paddles.forEach((paddle) => {
      if (this.ballImpactsPaddle(paddle)) {
        // Calcular la posición relativa en la pala (0 arriba, 1 abajo)
        const relativePosition =
          (this.ball.posy + this.ball.sizex - paddle.posy) / (paddle.sizey + this.ball.sizex);
        // Calcular el ángulo de rebote en función de la posición
        const maxBounceAngle = 60 * (Math.PI / 180); // Máximo ángulo de rebote (60 grados en radianes)
        let bounceAngle = (2 * relativePosition - 1) * maxBounceAngle;
        // Asegurarse de que el ángulo sea negativo si golpea paddle2 (pala de la derecha)
        if (paddle === this.paddles[1]) {
          bounceAngle = Math.PI - bounceAngle; // Invertir el ángulo
        }
        if (this.ball.speed < this.ball.config.ballTopSpeed)
          this.ball.speed *= 1.1;
        // Mantener la velocidad constante
        const currentSpeed = Math.sqrt(
          this.ball.directionx ** 2 + this.ball.directiony ** 2
        );
        this.ball.directionx = Math.cos(bounceAngle) * currentSpeed;
        this.ball.directiony = Math.sin(bounceAngle) * currentSpeed;
      }
    });
    let lowerbound = config.canvasHeight - this.ball.sizex;
    if (this.mode == 0){
      if (this.ball.posy < 0 || this.ball.posy > lowerbound) {
          this.ball.wallReflection();
      }
    }
    else if (this.mode == 1){
      if (this.ball.posy < 0) {
        // Atraviesa la parte superior, aparece por la parte inferior
        this.ball.posy = config.canvasHeight;
      } else if (this.ball.posy > config.canvasHeight) {
        // Atraviesa la parte inferior, aparece por la parte superior
        this.ball.posy = 0;
      }      
    }
  }
}
