import { Chat } from "../models/chat.model";

export class ChatWithUsernamesDto {
    id: number;
    isPublic: boolean;
    users: string[];
    constructor(chat: Chat) {
        this.id = chat.id;
        this.isPublic = chat.isPublic;
        this.users = chat.users.map(u => u.userName);
    }
}