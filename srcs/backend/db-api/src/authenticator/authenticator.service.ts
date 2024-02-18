import { Injectable, ForbiddenException } from '@nestjs/common';
import { FtOauthService } from './ftOAuthService';
import * as jwt from 'jsonwebtoken'
import * as net from "net"
import axios from "axios"
import * as fs from "fs"
import * as qrcode from "qrcode"
import * as speakeasy from "speakeasy"
import { BansService } from 'src/bans/bans.service';
import { UsersService } from 'src/users/services/users.service';
import { Logger } from "@nestjs/common";

@Injectable()
export class AuthenticatorService {
	constructor(
		private readonly userService : UsersService,
		private readonly banService : BansService,
		private readonly ftAuthService: FtOauthService
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

	async tryCode(code) {
		const log_attempt = await this.ftAuthService.getOAuthKey(code);
		if (log_attempt.status != 'ko')
		{
			const personal = await this.ftAuthService.getPersonalInfo(log_attempt.token)

			let user : any;
			try {
				user = await this.userService.signIn(personal.login);
				if (user.has2FA) {
					log_attempt.status = 'needs_2fa'
					log_attempt.fa_token = jwt.sign({login: personal.login, username: user.dataValues.id}, 'TODO FA LOG TOKEN')
				} else {
					log_attempt.status = 'success'
					if (await this.banService.isBannedById(user.dataValues.id))
					{
						throw new ForbiddenException('You\'re banned');
					}
					this.userService.setOnlineStatus(user.id, true) //TODO QUITAR ESTO. Es un apaño para npinto-g
					log_attempt.log_token = jwt.sign({login: personal.login, username: user.dataValues.id}, 'TODO the REAL secret')
				}
			} catch (e) {
				log_attempt.status = 'needs_register';
				log_attempt.register_token = jwt.sign({login: personal.login}, 'TODO change SUPER SECRET')
				this.pixelizeImage(personal.image.link, personal.login)
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