import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Admin } from "./admin.model";
import { UsersService } from "../users/services/users.service";
import { NewUser } from "../users/dto/new-user.dto";
import { User } from "../users/models/user.model";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AdminsService {
    private readonly caliphLogin: string;
    constructor (
        private readonly usersService: UsersService,
        @InjectModel(Admin)
        private adminModel: typeof Admin,
        private appConfig: ConfigService,
    ) {
        this.caliphLogin = this.appConfig.getOrThrow('CALIPH_USER');
    }

    async findAll(): Promise<Admin []> {
        return this.adminModel.findAll();
    }

    async findOne(id: number): Promise<Admin> {
        return this.adminModel.findOne({
            where: {
                id,
            },
            include: User
        });
    }

    async create(newUser: NewUser): Promise<Admin> {
        const user = await this.usersService.create(newUser);

        return this.adminModel.create({
            id: user.id
        });
    }

    async riseToAdmin(user: string): Promise<Admin> {
        const userId = await this.usersService.userExists(user);
        if (!userId) {
            throw new BadRequestException("User doesn't exist");
        }

        return this.adminModel.create({
            id: userId
        });
    }

    async revokeAdminPrivileges(user: string): Promise<void> {
        const userId = await this.usersService.getFtLogin(user);
        if (!userId) {
            throw new BadRequestException("User doesn't exist");
        }

        if (userId.loginFT == this.caliphLogin) {
            throw new BadRequestException("This user is the Caliph, cannot revoke this priviledge");
        }

        await this.adminModel.destroy({
            where: {
                id: userId
            }
        });
    }

    async isAdmin(userId: number): Promise<boolean> {
        const user = this.usersService.findOneById(userId);
        const admin = this.findOne(userId);
        return Promise.all([user, admin]).then(data => (data[0] != null && data[0].userName == this.caliphLogin) || data[1] != null);
    }
}