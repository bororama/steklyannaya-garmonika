import { PublicUserDto } from "./public-user.dto";
import { ChatUsers } from "../../chat-user/models/chatUsers.model";

export class ChatUserDto extends PublicUserDto {
    isAdmin: boolean;
    isMuted: boolean;
    isOwner: boolean;
    isBanned: boolean;

    constructor (chatInfo: ChatUsers, isBanned: boolean) {
        super(chatInfo.user);
        this.isAdmin = chatInfo.isAdmin;
        this.isMuted = chatInfo.isMuted;
        this.isOwner = chatInfo.isOwner;
        this.isBanned = isBanned;
    }
}