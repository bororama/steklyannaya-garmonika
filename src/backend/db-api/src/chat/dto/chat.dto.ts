import { ChatUserDto } from "../../users/dto/chat-user.dto";
import { Chat } from "../models/chat.model";
import { ChatUsers } from "../../chat-user/models/chatUsers.model";

export class ChatDto {
    constructor (chat: Chat, chatUsers?: ChatUsers[]) {
        this.id = chat.id;
        this.users = chatUsers?.filter(c => c.chatId == chat.id).map(c => new ChatUserDto(c)) ?? [];
    }
    id: number;
    users: ChatUserDto[];
}