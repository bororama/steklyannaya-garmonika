import { GameEntity } from "./gameEntity";
import { type User } from "./shared/meta.interface"
import { Color3, Scene, StandardMaterial, GlowLayer, Material, Vector3, Quaternion } from "@babylonjs/core";

export class NPC extends GameEntity {

    private _dialogue : Array<string>;

    constructor(assets : any, scene: Scene, name : string, type : string, positon : Vector3, orientation : Quaternion, dialogue : Array<string> = []) {
        super(assets, scene, name, type);
        this.updatePosition(positon);
        this.updateRotation(orientation);
        this._dialogue  = dialogue;
    }

    saySomething() {
        if (this._dialogue.length) {
            const chosenSnippet =  this._dialogue[Math.floor(Math.random() * this._dialogue.length)];
            this.say(chosenSnippet);
        }
    }

}

