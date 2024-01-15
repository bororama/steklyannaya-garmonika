import { User } from "../models/user.model";

export class UserDto {
    id: number;
    name: string;
    profilePic: string;
    inventory: string;

    constructor (user: User) {
        this.id = user.id;
        this.name = user.userName;
        this.profilePic = user.profilePic;
        this.inventory = user.inventory;
    }
}
