import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import { NewUser } from '../dto/new-user.dto';
import { Block } from '../models/block.model';
import { Chat } from '../../chat/models/chat.model';
import { ChatUsers } from '../../chat-user/models/chatUsers.model';
import { ChatDto } from '../../chat/dto/chat.dto';
import { UpdatePlayerDto } from '../dto/player-update.dto';
import { UserStatus } from '../dto/user-status.enum';
import { Op } from 'sequelize';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        @InjectModel(Block)
        private blockModel: typeof Block,
        @InjectModel(ChatUsers)
        private chatUsersModel: typeof ChatUsers,
    ) {}

    async findAll(): Promise<User[]> {
        return this.userModel.findAll({
            attributes: { exclude: ['secret2FA', 'has2FA', 'inventory'] }
        });
    }

    async findAllExcludingRequester(requester: number): Promise<User[]> {
        return this.userModel.findAll({
            where: {
                id: { [Op.ne]: requester }
            }
        });
    }

    async findOne(user: string): Promise<User> {
        const searchCriteria = isNaN(+user)
            ? { userName: user }
            : { id: +user };
        return this.userModel.findOne({
            where: searchCriteria,
        });
    }

    async findOneLight(user: string): Promise<User> {
        const searchCriteria = isNaN(+user)
            ? { userName: user }
            : { id: +user };
        return this.userModel.findOne({
            where: searchCriteria,
            attributes: ['id', 'userName', 'status']
        });
    }


    async findOneById(user: number): Promise<User> {
        return this.userModel.findByPk(user);
    }
    
    async findOneByFtLogin(user: string): Promise<User> {
        return this.userModel.findOne({
            where: {
                loginFT: user
            }
        });
    }

    async userExists(user: string): Promise<number> {
        const searchCriteria = isNaN(+user)
            ? { userName: user }
            : { id: +user };
        return this.userModel.findOne({
            where: searchCriteria,
            attributes: [ 'id' ]
        }).then( u => u?.id);
    }

    async getFtLogin(user: string): Promise<User> {
        const searchCriteria = isNaN(+user)
            ? { userName: user }
            : { id: +user };
        return this.userModel.findOne({
            where: searchCriteria,
            attributes: [ 'id', 'loginFT' ]
        });
    }

    async create(newUser: NewUser): Promise<User> {
        return this.userModel.create({
            loginFT: newUser.loginFt,
            userName: newUser.userName,
            profilePic: newUser.profilePic,
            has2FA: newUser.has2FA,
        });
    }

    async remove(userId: string): Promise<void> {
        const user = await this.findOne(userId);
        if (!user) {
            throw new BadRequestException('User doesn\'t exists');
        }
        await user.destroy();
    }

    async setOnlineStatus(userId: string, status: boolean): Promise<void> {
        const user = await this.findOne(userId);
        if (!user) {
            throw new BadRequestException('User doesn\'t exists');
        }
        user.status = (status ? UserStatus.online : UserStatus.offline);
        user.save();
    }

    async setUserProfilePic(userId: string, profilePic: string) : Promise<void> {
        const user = await this.findOne(userId);
        if (!user) {
            throw new BadRequestException('User doesn\'t exists');
        }
        user.profilePic = profilePic
        user.save()
    }

    async signIn(loginFt: string): Promise<User> {
        const user = await this.userModel.findOne({ where: { loginFT: loginFt } });
        if (!user) {
            throw new BadRequestException('Is not registered yet');
        }
        return user.save();
    }
    
    async changeUsername(userId: string, newUsername: string) : Promise<void> {
        const user = await this.findOne(userId);
        if (!user) {
            throw new BadRequestException('User doesn\'t exists');
        }

        if (user.userName == newUsername)
        {
            throw new BadRequestException('User already use this Name');
        }

        user.userName = newUsername;
        try {
            await user.save();
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                error.errors.forEach((validationError) => {
                if (validationError.type == 'unique violation') {
                    throw new BadRequestException("This User Name is already in use");
                } else {
                    Logger.warn(`${validationError.type}: ${validationError.message}`);
                    throw new BadRequestException("There was an error");
                }
                });
            } else {
                Logger.warn('Error:', error);
                throw new BadRequestException("There was an error");
            }
        }
    }

    async set2FA(userId: string, status: boolean): Promise<void> {
        const user = await this.findOne(userId);
        if (!user) {
            throw new BadRequestException('User doesn\'t exists');
        }
        user.has2FA = status;
        await user.save();
    }

    async set2FAsecret(userId: string, secret: string) : Promise<void> {
        const user = await this.findOne(userId);
        if (!user) {
            throw new BadRequestException('User doesn\'t exists');
        }
        user.secret2FA = secret;
        await user.save();
    }

    async get2FAsecret(userId: string) : Promise<string> {
        const user = await this.findOne(userId);
        if (!user) {
            throw new BadRequestException('User doesn\'t exists');
        }
        return user.secret2FA;

    }

    async getBlockedUsers(user: string): Promise<User[]> {
        const userId = await this.userExists(user);
        if (isNaN(userId)) {
            throw new BadRequestException('User doesn\'t exists');
        }

        return this.blockModel
            .findAll ({
                where: {
                    blockerId: +userId
                },
                include: {
                    model: User,
                    as: 'blocked'
                }
            })
            .then (
                blockedUsers => blockedUsers
                    .map(block => block.blocked)
            );
    }

    async blockUser(blocker: string, blocked: string): Promise<void> {
        const userId = await this.userExists(blocker);
        const blockedUserId = await this.userExists(blocked);
        if (isNaN(userId) || isNaN(blockedUserId)) {
            throw new BadRequestException('User doesn\'t exists');
        }

        try {
            await this.blockModel.create({
                blockerId: userId,
                blockedId: blockedUserId
            });
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                error.errors.forEach((validationError) => {
                if (validationError.type == 'unique violation') {
                    throw new BadRequestException("User is already blocked");
                } else {
                    Logger.warn(`${validationError.type}: ${validationError.message}`);
                    throw new BadRequestException("There was an error");
                }
                });
            } else {
                Logger.warn('Error:', error);
                throw new BadRequestException("There was an error");
            }
        }
    }

    async unblockUser(blocker:string, blocked: string): Promise<void> {
        const userId = await this.userExists(blocker);
        const blockedUserId = await this.userExists(blocked);
        if (isNaN(userId) || isNaN(blockedUserId)) {
            throw new BadRequestException('User doesn\'t exists');
        }

        this.blockModel.destroy({
            where: {
                blockerId: userId,
                blockedId: blockedUserId
            }
        });
    }

    async getOnlineUsers(): Promise<User[]> {
        return this.userModel.findAll({
            where: {
                status: {
                    [Op.ne]: UserStatus.offline
                }
            }
        });
    }

    async getUserChats(idOrUsername: string): Promise<ChatDto[]> {
        const searchCriteria = isNaN(+idOrUsername)
            ? { userName: idOrUsername }
            : { id: +idOrUsername };
        const user = await this.userModel.findOne({
            attributes: ['id'],
            where: searchCriteria,
            include: {
                model: Chat,
                where: {
                    isPrivateChat: false
                },
                required: false
            }
        });
        if (!user) {
            throw new BadRequestException('User doesn\'t exists');
        }

        return Promise.all(user.chats.map(async chat => {
            const users = await this.chatUsersModel.findAll({
                where: { chatId: chat.id },
                include: { model: User }
            });
            return new ChatDto(chat, users);
        }));
    }

    async getConnectStatus(playerId: string): Promise<string> {
        const player = await this.findOne(playerId);
        if (!player) {
            throw new BadRequestException("Player doesn\'t exists");
        }
        if (player.status == UserStatus.online)
          return ('metaversing')
        else
          return ('disconnected')
    }

    update(user: User, newData: UpdatePlayerDto): Promise<User> {
        if (newData.userName) {
            user.userName = newData.userName;
        }

        if (newData.profilePic) {
            user.profilePic = newData.profilePic;
        }

        if (newData.has2FA) {
            user.has2FA = newData.has2FA;
        }
        return user.save();
    }

    async deleteUser(user: number): Promise<void> {
        await this.userModel.destroy({ where: { id: user } });
    }

    async addCoins(userId: string, quantity: number) : Promise<string> {
        let user = await this.findOne(userId);
        if (!user) {
            throw new BadRequestException('User doesn\'t exist')
        }
        user.franciscoins += quantity;
        user.save();
        return ('ok');
    }

    async subtractCoins(user: User, quantity: number) : Promise<string> {
        if (user.franciscoins < quantity)
            return ('not_enough_coins')
        else {
            user.franciscoins -= quantity;
            await user.save();
            return ('ok');
        }   
    }

    async addPearls(user: User, quantity: number) : Promise<string> {
        user.pearls += quantity;
        await user.save();
        return ('ok');
    }

    async subtractPearls(userId: string, quantity: number) : Promise<string> {
        let user = await this.findOne(userId);
        if (!user) {
            throw new BadRequestException('User doesn\'t exist')
        }
        if (user.pearls< quantity)
            return ('not_enough_pearls')
        else {
            user.pearls -= quantity;
            user.save();
            return ('ok');
        }
    }

    async addNecklace(user: User, quantity: number) : Promise<string> {
        user.necklaces += quantity;
        await user.save();
        return ('ok');
    }

    async subtractNecklace(userId: string, quantity: number) : Promise<string> {
        let user = await this.findOne(userId);
        if (!user) {
            throw new BadRequestException('User doesn\'t exist')
        }
        if (user.necklaces < quantity)
            return ('not_enough_necklaces')
        else {
            user.necklaces -= quantity;
            user.save();
            return ('ok');
        }
    }

    async subtractNecklaceFromUser(user: User, quantity: number) : Promise<boolean> {
        if (user.necklaces < quantity)
            return false;
        else {
            user.necklaces -= quantity;
            await user.save();
            return true;
        }
    }
}
