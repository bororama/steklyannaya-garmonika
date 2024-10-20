import { ChatUserDto } from "../../users/dto/chat-user.dto";
import { Chat } from "../models/chat.model";
import { ChatUsers } from "../../chat-user/models/chatUsers.model";
import { ChatBans } from "../../chat-user/models/chatBan.model";

export class ChatDto {
    constructor (chat: Chat, chatUsers?: ChatUsers[], chatBans?: ChatBans[]) {
        this.id = chat.id;
        this.isPublic = chat.isPublic;
        this.users = chatUsers?.filter(c => c.chatId == chat.id).map(c => new ChatUserDto(c, chatBans?.find(b => b.userId == c.userId) !== undefined)) ?? [];
    }
    id: number;
    isPublic: boolean;
    users: ChatUserDto[];
}
