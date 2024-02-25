import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UsersService } from '../../users/services/users.service';
import { Chat } from '../models/chat.model';
import { Message } from '../models/message.model';
import { Op } from 'sequelize';
import { ChatUsers } from '../../chat-user/models/chatUsers.model';
import { User } from '../../users/models/user.model';

@Injectable()
export class MessageService {

    constructor (
        @InjectModel(Message)
        private messageModel: typeof Message,
        private userService: UsersService,
    ) {}

	async sendMessageWithId(emitter: string, receptor: Chat, message: string): Promise<void> {
		const user = await this.userService.userExists(emitter);
		if (!user) {
            throw new BadRequestException("User doesn't exist");
		}
		
		await this.messageModel.create({
			senderId: user,
			chatId: receptor.id,
			sentDate: new Date(),
			message: message
		});
	}

	async sendMessage(emitter: User, receptor: Chat, message: string): Promise<void> {
		await this.messageModel.create({
			senderId: emitter.id,
			chatId: receptor.id,
			sentDate: new Date(),
			message: message
		});
	}

	async getMessages(chat: ChatUsers): Promise<Message[]> { //TODO: Test
		const blockedUsers = await this.userService.getBlockedUsersById(chat.userId).then(users => users.map(u => u.id));
		return this.messageModel.findAll({
			where: {
				chatId: chat.chatId,
				sentDate: {
					[Op.gte]: chat.lastMsgReadDate
				},
				[Op.not]: {
					senderId: chat.userId
				},
				senderId: {
					[Op.notIn]: blockedUsers
				}
			},
            order: [
                ['sentDate', 'ASC']
            ]
		})
	}
}
