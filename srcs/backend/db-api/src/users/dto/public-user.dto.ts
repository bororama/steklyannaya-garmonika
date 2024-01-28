import { User } from "../models/user.model";
import { UserStatus } from "./user-status.enum";

export class PublicUserDto {
    id: number;
    name: string;
    profilePic: string;
    status?: UserStatus;

    constructor (user: User) {
        this.id = user.id;
        this.name = user.userName;
        this.profilePic = user.profilePic;
        this.status = user.status;
    }
}