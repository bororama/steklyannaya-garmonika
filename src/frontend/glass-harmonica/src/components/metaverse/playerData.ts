
import { type User, type Player } from "./shared/meta.interface";
import { getRandomUsername } from "./utils";
import { Vector3, Quaternion } from "@babylonjs/core"

export class PlayerData implements Player {
    
    static numberOfPlayers : number = 0;
    public user : User;
    public position : Array<number>;
    public rotation : Array<number>;
    public state : number;


    constructor(locator : number, name : string) {
        this.user  = { locator : locator,  name : name};
        this.position = Array(3);
        this.rotation = Array(4);
        this.state = 0;
    }

    setPosition (u : Vector3) {

       this.position[0] = u.x;
       this.position[1] = u.y;
       this.position[2] = u.z;
    }

    setRotation(q : Quaternion) {
        this.rotation[0] = q.x;
        this.rotation[1] = q.y;
        this.rotation[2] = q.z;
        this.rotation[3] = q.w;
    }

    setState(s: number ) {
        this.state = s;
    }
}