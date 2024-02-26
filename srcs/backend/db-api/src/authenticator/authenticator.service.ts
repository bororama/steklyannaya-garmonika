import { Injectable, ForbiddenException } from '@nestjs/common';
import { FtOauthService } from './ftOAuthService';
import * as jwt from 'jsonwebtoken'
import * as net from "net"
import axios from "axios"
import * as nfs from "node:fs"
import * as fs from "fs"
import * as qrcode from "qrcode"
import * as speakeasy from "speakeasy"
import { BansService } from '../bans/bans.service';
import { UsersService } from '../users/services/users.service';
import { Logger } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthenticatorService {
	public readonly jwt_log_secret : string = this.configService.get('JWT_LOG_SECRET');
	public readonly jwt_2fa_secret : string = this.configService.get('JWT_2FA_SECRET');
	public readonly jwt_register_secret : string = this.configService.get('JWT_REGISTER_SECRET');
	constructor(
		private readonly userService : UsersService,
		private readonly banService : BansService,
		private readonly ftAuthService: FtOauthService,
		private readonly configService: ConfigService
	) {}

	async pixelizeAndStoreProfileImage(login: string, image_raw:any) {
		let buffer: Buffer = Buffer.from('');
		const host = 'meta_face_demaker'
		const port = 6000
		const pixelizer= net.createConnection({ host, port }, () => {
			pixelizer.write(image_raw.data);
			pixelizer.end();
		});
		pixelizer.on('data', (data) => {
			let combined_buffer:Buffer = Buffer.concat([buffer, data]);
			buffer = combined_buffer;
		});
		pixelizer.on('end', () => {
			fs.appendFile('/app/src/profile_pics/' + login + '.png', buffer, (err) => {
				if (err) {
					Logger.error('Could not write file for user: ' + login);
				}
			});
		});
		pixelizer.on('error', () => {
		})
	}

	async pixelizeImage(imageUrl:string, login:string) {
      if (imageUrl == undefined || imageUrl.endsWith(".gif")) {
        nfs.copyFile('/app/src/profile_pics/default_avatar.png', '/app/src/profile_pics/' + login + '.png', ()=>{})
      } else {
		axios({
		  method: 'get',
		  url: imageUrl,
		  responseType: 'arraybuffer'
		}).then((image_raw) => {
		   this.pixelizeAndStoreProfileImage(login, image_raw)
		}).catch((err) => {
		  console.log(err)
		})
      }
	}

	async tryCode(code) {
		const log_attempt = await this.ftAuthService.getOAuthKey(code);
		if (log_attempt.status != 'ko')
		{
			const personal = await this.ftAuthService.getPersonalInfo(log_attempt.token)

			let user : any;
			try {
				user = await this.userService.signIn(personal.login);
				if (!user) {
					throw new ForbiddenException('Needs to register');
				}
				if (user.has2FA) {
					log_attempt.status = 'needs_2fa'
					log_attempt.fa_token = jwt.sign({login: personal.login, username: user.dataValues.id}, this.jwt_2fa_secret)
				} else {
					log_attempt.status = 'success'
					if (await this.banService.isBannedById(user.dataValues.id))
					{
						throw new ForbiddenException('You\'re banned');
                    }
                    if (user.dataValues.status == "online")
                    {
                      log_attempt.status = 'already_connected'
                    }
					log_attempt.log_token = jwt.sign({login: personal.login, username: user.dataValues.id}, this.jwt_log_secret)
				}
			} catch (e) {
				log_attempt.status = 'needs_register';
				log_attempt.register_token = jwt.sign({login: personal.login}, this.jwt_register_secret)
				this.pixelizeImage(personal.image.versions.large, personal.login)
			}
			const return_tok = {status: log_attempt.status, register_token: log_attempt.register_token, log_token: log_attempt.log_token, fa_token: log_attempt.fa_token, auto_image:'/src/profile_pics/' + personal.login + '.png'}
			return (return_tok);
		}
		else {
			const return_tok = {status: 'ko'}
			return (return_tok)
		}
	}

	async get2FACode(username) : Promise<string> {
		const secret = speakeasy.generateSecret();
	
		await this.userService.set2FAsecret(username, secret.base32)
	
		let image  = await qrcode.toDataURL(secret.otpauth_url);
		return image
	}
}
