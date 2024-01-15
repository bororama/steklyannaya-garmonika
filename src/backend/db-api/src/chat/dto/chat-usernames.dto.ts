import { Chat } from "../models/chat.model";

export class ChatWithUsernamesDto {
    id: number;
    users: string[];
    constructor(chat: Chat) {
        this.id = chat.id;
        this.users = chat.users.map(u => u.userName);
    }
}