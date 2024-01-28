import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, ForbiddenException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { FtOauthService } from './getOAuthKey';
import { UsersService } from '../users/services/users.service'
import { PlayersService } from '../users/services/players.service'
import { NewPlayer } from '../users/dto/new-player.dto'
import { PlayerDto } from "../users/dto/player.dto"
import { RegisterInfoDto } from './register_info.dto'
import { RegisterAnswerDto } from './register_answer.dto'
import { FaInfoDto } from './fa_info.dto'
import { Enable2FAInfoDto } from './enable2faInfo.dto'
import { Generate2FASecretAnswerDto } from './generate2FAsecret_answer-dto'
import * as jwt from 'jsonwebtoken'
import { ApiBody } from "@nestjs/swagger"
import * as net from "net"
import axios from "axios"
import * as fs from "fs"
import * as qrcode from "qrcode"
import * as speakeasy from "speakeasy"
import { AdminsService } from 'src/admins/admins.service';
import { Player } from 'src/users/models/player.model';
import { BansService } from 'src/bans/bans.service';

@Controller('log')
export class AuthenticatorController {

  constructor (
    private readonly userService : UsersService,
    private readonly playerService : PlayersService,
    private readonly adminService : AdminsService,
    private readonly banService : BansService,
    private readonly ftAuthService: FtOauthService,
  ) {}

  @Get('code/:code')
  tryLogWithCode(@Param('code') code :string) : Promise<any> {
    return this.tryCode(code).then((tok) => {
      return tok
    })
  }

  async pixelizeAndStoreProfileImage(login: string, image_raw:any) {
      let buffer: Buffer = Buffer.from('');
      const host = 'meta_face_demaker'
      const port = 6000
      const pixelizer= net.createConnection({ host, port }, () => {
          console.log(`Connected to pixelizer server`);
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
                  console.error('Could not write file for user: ' + login);
              }
          });
      });
      pixelizer.on('error', () => {
          console.log("Image server unavailable");
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

  @Post('with_fa')
  @ApiBody({type: FaInfoDto, required:true})
  async getLogTokenFromFa(@Body() fa_info : FaInfoDto) : Promise<any> {
     let payload:any = jwt.verify(fa_info.fa_token, 'TODO FA LOG TOKEN')
     //TODO incorrect verify

    const secret = await this.userService.get2FAsecret(payload.username)
    console.log(fa_info.code)
    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    })
    console.log(token)
    const isValid = speakeasy.totp.verify({secret:secret,
                                          encoding: 'base32',
                                          token: fa_info.code,
                                          window: 6})
    let data : any = {
        token: '',
        status: ''
    }
    if (isValid) {
      data.token = jwt.sign({login: payload.login, username: payload.username}, 'TODO the REAL secret')
      data.status = 'ok'
    }
    else
      data.status = 'ko'
    return data
  }

  @Post('register')
  @ApiBody({type: RegisterInfoDto, required:true})
  async registerUser(@Body() register_info : RegisterInfoDto) : Promise<RegisterAnswerDto> {
    try {
        let payload:any = jwt.verify(register_info.register_token, 'TODO change SUPER SECRET')
        //TODO incorrect verify
        const player : NewPlayer = {
          userName: register_info.username,
          loginFt: payload.login,
          profilePic: 'src/profile_pics/' + payload.login + '.png',
        }
        let rval : any = await this.playerService.create(player)
        let answer : RegisterAnswerDto = {
            status:'ok',
            meta_token: jwt.sign({username: rval.id}, 'TODO the REAL secret')
        }
        return (answer)
      }
      catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            error.errors.forEach((validationError) => {
            if (validationError.type == 'unique violation') {
                throw new BadRequestException("User already exists");
            } else {
                throw new BadRequestException('Other validation error:', validationError.message);
            }
            });
        } else {
            console.error('Error:', error);
            throw new BadRequestException("There was an error");
        }
    }
  }

  @Get('me/:token')
  async getMyData(@Param('token') token :string) : Promise<PlayerDto> {
    // TODO answer with bad request
     let payload: any = jwt.verify(token, 'TODO the REAL secret')
     const player: Player = await this.playerService.findOne(payload.username)
     const playerDto = new PlayerDto(player, await this.adminService.isAdmin(player.id))
     return playerDto
  }

  @Get('generate2FAsecret/:token')
  async generate2FAsecret (@Param('token') token : string) : Promise<Generate2FASecretAnswerDto> {
     let payload:any = jwt.verify(token, 'TODO the REAL secret')
     const enable2FA_token : string = jwt.sign({username: payload.username}, 'TODO 2FA secret')
     const qr : string = await this.get2FACode(payload.username);

     const answer :  Generate2FASecretAnswerDto = {
       token: enable2FA_token,
       qr: qr
     }
     return (answer)
  }

  async get2FACode(username) : Promise<string> {
    const secret = speakeasy.generateSecret();
    console.log("Activating 2FA for: " + username);

    await this.userService.set2FAsecret(username, secret.base32)

	let image  = await qrcode.toDataURL(secret.otpauth_url);
    return image
  }

  @Post('confirm2FA')
  async confirm2FAEnable (@Body() enable2FAInfo: Enable2FAInfoDto) : Promise<string> {
    let payload:any = jwt.verify(enable2FAInfo.token, 'TODO the REAL secret')
    const secret = await this.userService.get2FAsecret(payload.username)
    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    })
    const isValid = speakeasy.totp.verify({secret:secret,
                                          encoding: 'base32',
                                          token:enable2FAInfo.code,
                                          window: 6})
    if (isValid) {
      this.userService.set2FA(payload.username, true)
      return 'ok'
    }
    else
      return 'ko'
  }

  @Post('disable2FA')
  async disable2FAEnable (@Body() enable2FAInfo: Enable2FAInfoDto) : Promise<string> {
    try {
      let payload:any = jwt.verify(enable2FAInfo.token, 'TODO the REAL secret')
      const secret = await this.userService.get2FAsecret(payload.username)
      const token = speakeasy.totp({
        secret: secret,
        encoding: 'base32'
      })
      const isValid = speakeasy.totp.verify({secret:secret,
                                            encoding: 'base32',
                                            token:enable2FAInfo.code,
                                            window: 6})
      if (isValid) {
        this.userService.set2FA(payload.username, false)
        return 'ok'
      }
      else
        return 'ko'
    } catch (e) {
      throw new UnauthorizedException('Unauthorized - Invalid JWT token format');
    }
  }

}
