import { GameEntity } from "./gameEntity";
import { Scene } from "@babylonjs/core";

export class RemotePlayer extends GameEntity {

    constructor(assets : any, scene: Scene, name : string) {
        super(assets, scene, name);
    }
}