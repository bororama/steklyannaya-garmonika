
import { type User, type Player } from "./shared/meta.interface";
import { getRandomUsername } from "./utils";
import { Vector3 } from "@babylonjs/core"

export class PlayerData implements Player {
    public user : User;
    public position : Array<number>;
    public state : number;

    constructor() {
        this.user  = { id: 0, name: getRandomUsername()};
        this.position = Array(3);
        this.state = 0;

        console.log(this.user, this.position, this.state);
    }

    setPosition (u : Vector3) {

       this.position[0] = u.x;
       this.position[1] = u.y;
       this.position[2] = u.z;
    } 
}