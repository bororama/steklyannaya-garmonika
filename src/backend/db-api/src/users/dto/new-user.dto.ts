import { IsNotEmpty, IsEmail } from 'class-validator';

export class NewUser
{
    @IsNotEmpty({ message: 'Username cannot be empty' })
    userName: string;
    @IsNotEmpty({ message: '42 login cannot be empty' })
    loginFt: string;
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;
    profilePic?: string;
    has2FA?: boolean;
}