import { IsNotEmpty } from 'class-validator';

export class NewUser
{
    @IsNotEmpty({ message: 'Username cannot be empty' })
    userName: string;
    @IsNotEmpty({ message: '42 login cannot be empty' })
    loginFt: string;
    profilePic?: string;
    has2FA?: boolean;
}