"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
var Config = /** @class */ (function () {
    function Config(width, height) {
        this.ballSize = width / 60;
        this.paddle1Width = width / 12;
        this.paddle2Width = this.paddle1Width;
        this.centerX = width / 2;
        this.centerY = height / 2;
        /*if la base de datos existe, leemos los datos de los players.
              else usamos los datos por defecto*/
        //datos por defecto:
        this.BACKGROUND_COLOUR = "black";
        this.ELEMENT_COLOUR = "white";
        this.paddle1Height = height / 50;
        this.paddle2Height = this.paddle1Height;
        this.paddle1Colour = this.ELEMENT_COLOUR;
        this.paddle2Colour = this.ELEMENT_COLOUR;
        this.speed = 2;
        this.pointsToWin = 5;
    }
    return Config;
}());
exports.Config = Config;
