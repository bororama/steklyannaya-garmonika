import { NewUser } from "./new-user.dto";

export class NewPlayer extends NewUser {
    defeats?: number;
    wins?: number;
    steps?: number;
}
