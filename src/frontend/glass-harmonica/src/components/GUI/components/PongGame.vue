<template>
  <div>
    <canvas ref="pongCanvas" style="z-index:10;"></canvas>
  </div>
</template>

<script lang="ts">
/* eslint-disable */
import { io, Socket } from "socket.io-client";
import { defineComponent } from "vue";
import { FrontendConfig } from "./FrontendConfig";

export default defineComponent({
  name: "PongGame",
  props: {
    modo: Number, // Define el prop "modo" que recibirá el componente
    pongRoomId: Number,
    isGameInProgress: Number, //deprecated
    metaSocket: Socket,
  },
  data() {
    return {
      socket: null as Socket | null,
      config: null as FrontendConfig | null,
      matchIndex: 0 as number,
      paddleIndex: -1 as number,
      scale: 1,
      ctx: null as CanvasRenderingContext2D | null,
      keysPressed: {} as Record<string, boolean>,
      colorSelector: 0 as number,
      colors: [] as string[],
    };
  },
  created() {
    if (!this.socket) {
      this.socket = io("http://localhost:3000/pong", { path: "/socket.io" });
      this.socket.on("connect_error", (error: any) => {
        console.error("Error de conexión:", error);
      });
    }
  },
  unmounted(){
    if (this.socket)
      this.socket.disconnect();
  },
  mounted() {
    const canvas = this.$refs.pongCanvas as HTMLCanvasElement | null;
    this.colors = ["black", "BlueViolet", "CadetBlue", "brown", "DarkGreen"];
    if (canvas) {
      this.ctx = canvas.getContext("2d");

      if (this.ctx) {
        this.ctx.canvas.width = window.innerWidth / 2;
        this.ctx.canvas.height = this.ctx.canvas.width / 2;
        this.config = new FrontendConfig(this.ctx.canvas.width, this.ctx.canvas.height);

        window.addEventListener("resize", this.handleWindowResize);

        if (this.socket) {
          this.socket.on("connect", () => {
            console.log("Connected to the server.");
            this.socket?.emit("beginGame", {
              mode: this.modo,
              pongRoomId: this.pongRoomId
            });
          });
          this.socket.on('matchInfo', (info: any) => {
            console.log("match info ", info.pongRoomId );
            this.matchIndex = info.matchIndex;
            this.paddleIndex = info.paddleIndex;
          });
          this.socket.on('updateGameState', (match: any) => {
            if (match.matchIndex === this.matchIndex) {
              this.updateCanvas(match);
            }
          });
          this.socket.on("updateScores", (scores: any[]) => {
            this.drawScores(scores);
          });
        }
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
      } else {
        console.error("Unable to get 2D context for canvas");
      }
    } else {
      console.error("Canvas element not found");
    }
  },
  beforeUnmount() {
  window.removeEventListener("resize", this.handleWindowResize);
  },
  methods: {
    writeStatusinCanvas(match: any){
      if (match.isGameInProgress === -1){
        if(this.socket)
          this.socket.disconnect();
        setInterval(() => this.writeInCanvas("Your Peng opponent fled before finishing the game."), 100);
      }
      if (match.isGameInProgress === 0){
        this.writeInCanvas("Waiting for your Peng opponent...");
      }
      if (match.isGameInProgress === 2){
        if(this.socket)
          this.socket.disconnect();
        setInterval(() => this.writeInCanvas("Match ended."), 100);
        setTimeout(() => {this.$emit('match_finish')}, 1000)
      }
  },
    handleWindowResize() {
    if (this.ctx) {
      this.calculateCanvasSize();
      this.drawBackground();
    }
  },
    writeInCanvas(str: string) {
    if (this.ctx && this.config) {
      this.drawBackground();
      const fontSize = this.ctx.canvas.width * 0.03;
      this.ctx.font = `${fontSize}px Arial`;
      this.ctx.fillStyle = this.config.ELEMENT_COLOUR;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";

      // Centrar el texto en el canvas
      const x = this.ctx.canvas.width / 2;
      const y = this.ctx.canvas.height / 2;

      this.ctx.fillText(str, x, y);
    } else {
      console.error("2D context or config is null");
    }
  },
    handleKeys() {
      if (this.socket) {
        if (this.keysPressed["w"]) {
          this.socket.emit("movePaddle", {
            playerId: this.socket.id,
            direction: "up",
          });
        } else if (this.keysPressed["s"]) {
          this.socket.emit("movePaddle", {
            playerId: this.socket.id,
            direction: "down",
          });
        } else {
          this.socket.emit("movePaddle", {
            playerId: this.socket.id,
            direction: "stop",
          });
        }
        if (this.keysPressed["o"]) {
          if (this.colorSelector != 0){
            this.colorSelector--;  
            this.config!.BACKGROUND_COLOUR = this.colors[this.colorSelector];
            console.log(this.colorSelector);
          }
        } else if (this.keysPressed["p"]) {
          if (this.colorSelector < this.colors.length - 1){
            this.colorSelector++;
            this.config!.BACKGROUND_COLOUR = this.colors[this.colorSelector];
            console.log(this.colorSelector);
          }
        }
      }
    },
    handleKeyDown(event: KeyboardEvent) {
      this.keysPressed[event.key] = true;
      this.handleKeys();
    },
    handleKeyUp(event: KeyboardEvent) {
      this.keysPressed[event.key] = false;
      this.handleKeys();
    },
    clearCanvas() {
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      } else {
        console.error("2D context is null");
      }
    },
    drawMiddleLine(){
      if (this.ctx && this.config){
          this.ctx.setLineDash([5, 3]);
          this.ctx.beginPath();
          this.ctx.moveTo(this.ctx.canvas.width / 2, 0);
          this.ctx.lineTo(this.ctx.canvas.width / 2, this.ctx.canvas.height);
          this.ctx.strokeStyle = this.config.ELEMENT_COLOUR;
          this.ctx.stroke();
      }
    },
    drawBackground(){
      if (this.ctx && this.config){
        this.ctx.fillStyle = this.config.BACKGROUND_COLOUR;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);          
      }
    },
    drawCanvas() {
      if (this.ctx && this.config) {
        this.drawBackground();
        this.drawMiddleLine();
        } else {
          console.error("2D context or config is null");
        }
    },
    drawPaddle(paddle: any) {
      if (this.ctx && this.config) {
        this.ctx.fillStyle = this.config.ELEMENT_COLOUR;
        this.ctx.fillRect(paddle.posx * this.scale, paddle.posy * this.scale, paddle.sizex * this.scale, paddle.sizey * this.scale);
      } else {
        console.error("2D context or config is null");
      }
    },
    drawBall(ball: any) {
      if (this.ctx && this.config) {
        this.ctx.fillStyle = this.config.ELEMENT_COLOUR;
        this.ctx.fillRect(ball.posx * this.scale, ball.posy * this.scale, ball.sizex * this.scale, ball.sizex * this.scale);
      } else {
        console.error("2D context or config is null");
      }
    },
    drawScore(score: any) {
      if (this.ctx && this.config && score && score.score !== undefined && score !== null) {
        const fontSize = this.ctx.canvas.width * 0.03;
      
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.fillStyle = this.config.ELEMENT_COLOUR;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(`${score.score}`, score.posx * this.scale, score.posy * this.scale);
      } else {
        console.error("2D context, config, or score is null or undefined");
      }
    },
    drawScores(scores: any[]) {
      scores.forEach((score: any) => {
        this.drawScore(score);
      });
    },
    calculateCanvasSize(){
      if (this.ctx){
        this.ctx.canvas.width = window.innerWidth / 2;
        this.ctx.canvas.height = this.ctx.canvas.width / 2;        
      }
    },
    updateCanvas(match: any) {
      if (this.ctx && this.config && match.matchIndex === this.matchIndex) {
        if (match.isGameInProgress === 1){
          this.scale = this.ctx.canvas.width / 1000;
          this.calculateCanvasSize();
          this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
          this.drawCanvas();
          if (match.paddles && Array.isArray(match.paddles)) {
                match.paddles.forEach((paddle: any) => {
                  this.drawPaddle(paddle);
            });
          }
          if (match.ball) {
            this.drawBall(match.ball);
          }
          if (match.scores && Array.isArray(match.scores)) {
              match.scores.forEach((score: any) => {
                this.drawScore(score);
            });
          } else {
            console.error("2D context, config, or scores is null or undefined");
          }
        }
        else{
          this.writeStatusinCanvas(match);
        }
      }
      },
    },
  });
</script>
