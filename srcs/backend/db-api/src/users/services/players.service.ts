import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UsersService } from "./users.service";
import { Player } from "../models/player.model";
import { NewPlayer } from "../dto/new-player.dto";
import { User } from "../models/user.model";
import { Op } from "sequelize";
import { Friendship } from "../models/friendship.model";
import { Ban } from "../../bans/ban.model";
import { UpdatePlayerDto } from "../dto/player-update.dto";
import { UserStatus } from "../dto/user-status.enum";
import { ChatService } from "../../chat/services/chat.service";

@Injectable()
export class PlayersService {
    constructor(
        private readonly usersService: UsersService,
        private readonly chatService: ChatService,
        @InjectModel(Player)
        private playerModel: typeof Player,
        @InjectModel(Friendship)
        private friendshipModel: typeof Friendship,
    ) {}

    async findAll(): Promise<Player []> {
        return this.playerModel.findAll({
            include: User
        });
    }

    async findAllExcludingRequester(requester: number): Promise<Player []> {
        if (!requester || isNaN(requester)) {
            return this.findAll();
        }
        return this.playerModel.findAll({
            include: User,
            where: {
                id: { [Op.ne]: requester }
            }
        });
    }

    async findAllWithBanStatus(requester: number) {
        if (!requester || isNaN(requester)) {
            return this.playerModel.findAll({
                include: [
                    {
                        model: User,
                        required: true
                    },
                    {
                        model: Ban,
                        required: false
                    }
                ]
            });
        }
        return this.playerModel.findAll({
            where: {
                id: { [Op.ne]: requester }
            },
            include: [
                {
                    model: User,
                    required: true
                },
                {
                    model: Ban,
                    required: false
                }
            ]
        });
    }

    async findOne(userId: string): Promise<Player> {
        if (!userId) {
            return undefined;
        }

        if (!isNaN(+userId)) {
            return this.playerModel.findOne({
                where: { id: +userId },
                include: {
                    model: User,
                    as: 'user',
                    required: true
                }
            });
        }

        return this.playerModel.findOne({
            include: {
                model: User,
                required: true,
                where: {
                    userName: userId
                }
            }
        });
    }

    async playerExists(userId: string): Promise<Player> {
        const user = await this.usersService.userExists(userId);
        if (!user) {
            throw new BadRequestException('User doesn\'t exists');
        }
        
        return this.playerModel.findByPk(user, {
            attributes: ['id', 'wins', 'defeats'],
            include: {
                model: User,
                attributes: ['status', 'loginFT']
            }
        });
    }

    async getPlayerStatus(playerId: number): Promise<UserStatus> {
        if (!playerId || isNaN(playerId)) {
            return undefined;
        }

        return this.playerModel.findByPk(playerId, {
            attributes: [],
            include: {
                model: User,
                attributes: ['status']
            }
        }).then(p => p.user.status);
    }

    async create(newPlayer: NewPlayer): Promise<Player> {
        try {
            const user = await this.usersService.create(newPlayer);
            const player = await this.playerModel.create({
                id: user.id,
            });
            player.user = user;
            return (player);
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                error.errors.forEach((validationError) => {
                if (validationError.type == 'unique violation') {
                    throw new BadRequestException("User is already exists");
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

    async giftPearl(playerId: string, newFriend: string): Promise<string> {
        const player = await this.usersService.findOne(playerId);
        if (!player) {
            throw new BadRequestException("Player doesn\'t exists");
        }

        const friend = await this.usersService.findOne(newFriend);
        if (!friend) {
            throw new BadRequestException("Targeted player doesn\'t exist");
        }

        if (player.id === friend.id) {
            throw new BadRequestException("You can't gift a pearl to yourself");
        }

        if (player.pearls < 1)
          return ('not_enough_pearls')
        
        this.sendFriendshipPetitionById(player.id, friend.id);    
        player.pearls -= 1;
        await player.save();
        return 'ok';
    }

    async sendFriendshipPetition(playerId: string, newFriend: string) : Promise<void> {
        const player = await this.usersService.userExists(playerId);
        if (!player) {
            throw new BadRequestException("Player doesn\'t exists");
        }

        const friend = await this.usersService.userExists(newFriend);
        if (!friend) {
            throw new BadRequestException("Targeted player doesn\'t exist");
        }

        if (player == friend) {
            throw new BadRequestException("You can't send a frienship petition to yourself");
        }
        
        const friendship = await this.friendshipModel.findOne({
            where: {
                [Op.or]: [
                    {
                       userId: player,
                       friendId: friend
                    },
                    {
                        userId: friend,
                        friendId: player
                    }
                ]
            }
        });
        if (friendship !== null && friendship !== undefined)
            throw new BadRequestException("Already sent");
        try {
            await this.friendshipModel.create({
                userId: player,
                friendId: friend,
                accepted: false
            });
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                error.errors.forEach((validationError) => {
                if (validationError.type == 'unique violation') {
                    throw new BadRequestException("Frienship petition already sent");
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

    async sendFriendshipPetitionById(playerId: number, newFriend: number) : Promise<void> {
        if (!playerId || !newFriend || isNaN(playerId) || isNaN(newFriend))
        {
            return ;
        }

        const friendship = await this.friendshipModel.findOne({
            where: {
                [Op.or]: [
                    {
                       userId: playerId,
                       friendId: newFriend
                    },
                    {
                        userId: newFriend,
                        friendId: playerId
                    }
                ]
            }
        });
        if (friendship !== null && friendship !== undefined)
            throw new BadRequestException("Already sent");
        try {
            await this.friendshipModel.create({
                userId: playerId,
                friendId: newFriend,
                accepted: false
            });
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                error.errors.forEach((validationError) => {
                if (validationError.type == 'unique violation') {
                throw new BadRequestException("Frienship petition already sent");
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

    async getReceivedFriendshipPetitions(playerId: string): Promise<Player[]> {
        const player = await this.usersService.userExists(playerId);
        if (!player) {
            throw new BadRequestException("Player doesn\'t exists");
        }

        return this.friendshipModel.findAll({
            where: {
                friendId: player,
                accepted: false
            },
            include: {
                model: Player,
                as: 'user',
                include: [
                    { model: User }
                ]
            }
        }).then(petitions => petitions.map(p => p.user));
    }

    async changePetitionStatus(playerId: string, newFriend: string, accept: boolean): Promise<void> {
        const player = await this.findOne(playerId);
        if (!player) {
            throw new BadRequestException("Player doesn\'t exists");
        }

        const friend = await this.findOne(newFriend);
        if (!friend) {
            throw new BadRequestException("Targeted player doesn\'t exist");
        }

        if (player.id === friend.id) {
            throw new BadRequestException("You are already your friend");
        }

        const petition = await this.friendshipModel.findOne({
            where: {
                userId: friend.id,
                friendId: player.id,
            }
        });
        if (!petition) {
            throw new BadRequestException("Request not found");
        }

        if (accept) {
            if (petition.accepted)
                throw new BadRequestException("Already friends");
            const privateChat = await this.chatService.createFriendshipChat(player.user, friend.user, petition);
            petition.chatId = privateChat.id;
            petition.accepted = true;
            await petition.save();
        }
        else {
            await this.friendshipModel.destroy({
                where: {
                    userId: friend.id,
                    friendId: player.id,
                }
            });
        }
    }

    async deleteFriend(playerId: string, newFriend: string): Promise<void> {
        const player = await this.usersService.userExists(playerId);
        if (!player) {
            throw new BadRequestException("Player doesn\'t exists");
        }

        const friend = await this.usersService.userExists(newFriend);
        if (!friend) {
            throw new BadRequestException("Targeted player doesn\'t exist");
        }

        if (player == friend) {
            throw new BadRequestException("You can't become your own enemy. Love yourself.");
        }

        const friendship = await this.friendshipModel.findOne({
            where: {
                [Op.or]: [
                    {
                       userId: player,
                       friendId: friend
                    },
                    {
                        userId: friend,
                        friendId: player
                    }
                ]
            }
        });

        await friendship.destroy();
    }

    async getFriends(playerId: string): Promise<Friendship[]> {
        const player = await this.usersService.userExists(playerId);
        if (!player) {
            throw new BadRequestException("Player doesn\'t exists");
        }

        let lovers: Promise<Friendship[]> = this.friendshipModel.findAll({
            where: {
                userId: player,
                accepted: true
            },
            include: {
                model: Player,
                as: 'friend',
                include: [
                    {
                        model: User
                    }
                ]
            }
        });

        let loves: Promise<Friendship[]> = this.friendshipModel.findAll({
            where: {
                friendId: player,
                accepted: true
            },
            include: {
                model: Player,
                as: 'user',
                include: [
                    {
                        model: User
                    }
                ]
            }
        });

        return Promise.all([lovers, loves]).then(love => love[0].concat(love[1]))
    }

    async isFriend(playerId: string, friendId: string):Promise<string> {
        const player = await this.usersService.userExists(playerId);
        if (!player) {
            throw new BadRequestException("Player doesn\'t exists");
        }
        const friend = await this.usersService.userExists(friendId);
        if (!friend) {
            throw new BadRequestException("Player doesn\'t exists");
        }
        return this.friendshipModel.findOne({
            where: {
                [Op.or]: [
                  {
                      userId: player,
                      friendId: friend
                  },
                  {
                      userId: friend,
                      friendId: player
                  }
                ]
            }
        }).then(f => f != null && f != undefined ? "yes" : "no");
    }

    async update(userId: string, newPlayer: UpdatePlayerDto): Promise<Player> {
        const user = await this.findOne(userId);
        if (!user) {
            throw new BadRequestException('User doesn\'t exist');
        }

        const modifiedUser = await this.usersService.update(user.user, newPlayer);
        if (!modifiedUser) {
            return null;
        }

        let modifiedPlayer = await user.save();
        modifiedPlayer.user = modifiedUser;

        return modifiedPlayer;

    }

    playerLeaderboard(): Promise<Player[]> {
        return this.playerModel.findAll({
            include: {
                model: User,
                attributes: ['userName', 'franciscoins', 'pearls'],
            },
            order: [
                ['user', 'pearls', 'DESC'],
            ]
        });
    }

}
