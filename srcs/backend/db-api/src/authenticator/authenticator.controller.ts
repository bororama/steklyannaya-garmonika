import { Controller, Get, Post, Body, Param, BadRequestException, UnauthorizedException, Req, Logger } from '@nestjs/common';
import { UsersService } from '../users/services/users.service'
import { PlayersService } from '../users/services/players.service'
import { NewPlayer } from '../users/dto/new-player.dto'
import { PlayerDto } from "../users/dto/player.dto"
import { RegisterInfoDto } from './dtos/register_info.dto'
import { RegisterAnswerDto } from './dtos/register_answer.dto'
import { FaInfoDto } from './dtos/fa_info.dto'
import { Enable2FAInfoDto } from './dtos/enable2faInfo.dto'
import { Generate2FASecretAnswerDto } from './dtos/generate2FAsecret_answer-dto'
import * as jwt from 'jsonwebtoken'
import { ApiBody } from "@nestjs/swagger"
import * as speakeasy from "speakeasy"
import { AdminsService } from '../admins/admins.service';
import { Player } from '../users/models/player.model';
import { AuthenticatorService } from './authenticator.service';

@Controller('log')
export class AuthenticatorController {
  constructor (
    private readonly userService : UsersService,
    private readonly playerService : PlayersService,
    private readonly adminService : AdminsService,
    private readonly authService: AuthenticatorService,
  ) {}

  extractJwt(request: any): string
  {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      Logger.debug("Request without authorization")
      throw new UnauthorizedException('Unauthorized - JWT token missing');
    }

    try {
      const [bearer, token] = authorizationHeader.split(' ');
      return token;
    }
    catch {
      console.log("EXTRACT CATCH")
      throw new UnauthorizedException('Unauthorized - Invalid JWT token');
    }
  }

  @Get('code/:code')
  tryLogWithCode(@Param('code') code :string) : Promise<any> {
    return this.authService.tryCode(code).then((tok) => {
      return tok
    })
  }

  @Post('with_fa')
  @ApiBody({type: FaInfoDto, required:true})
  async getLogTokenFromFa(@Body() fa_info : FaInfoDto) : Promise<any> { 
    let payload:any
    try {
      payload = jwt.verify(fa_info.fa_token, this.authService.jwt_2fa_secret)
    }
    catch {
      throw new UnauthorizedException('Unauthorized - Invalid JWT token');
    }

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
      data.token = jwt.sign({login: payload.login, username: payload.username}, this.authService.jwt_log_secret)
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
        let payload:any = jwt.verify(register_info.register_token, this.authService.jwt_register_secret)
        const player : NewPlayer = {
          userName: register_info.username,
          loginFt: payload.login,
          profilePic: 'src/profile_pics/' + payload.login + '.png',
        }
        let rval : any = await this.playerService.create(player)
        let answer : RegisterAnswerDto = {
            status:'ok',
            meta_token: jwt.sign({username: rval.id}, this.authService.jwt_log_secret)
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
        } else if (error.name === 'JsonWebTokenError'){
            throw new UnauthorizedException('Unauthorized - Invalid JWT token');
        }
        else {
            console.error('Error:', error.message);
            throw new BadRequestException("There was an error");
        }
    }
  }

  @Get('me')
  async getMyData(@Req() request) : Promise<PlayerDto> {
    let payload : any;
    const token : string = this.extractJwt(request);
    try {
      console.log("THIS IS THE TOKEN")
      console.log (token)
      console.log (this.authService.jwt_log_secret)
      payload = jwt.verify(token, this.authService.jwt_log_secret)
    }
    catch {
      console.log("ME CATCH")
      throw new UnauthorizedException('Unauthorized - Invalid JWT token');
    }
    const player: Player = await this.playerService.findOne(payload.username)
    const playerDto = new PlayerDto(player, await this.adminService.isAdmin(player.id))
    return playerDto
  }

  @Get('generate2FAsecret')
  async generate2FAsecret (@Req() request) : Promise<Generate2FASecretAnswerDto> {
    let payload : any;
    const token : string = this.extractJwt(request);
    try {
      payload = jwt.verify(token, this.authService.jwt_log_secret);
    }
    catch {
      throw new UnauthorizedException('Unauthorized - Invalid JWT token');
    }
    const enable2FA_token : string = jwt.sign({username: payload.username}, this.authService.jwt_2fa_secret)
    const qr : string = await this.authService.get2FACode(payload.username);

    const answer :  Generate2FASecretAnswerDto = {
      token: enable2FA_token,
      qr: qr
    }
    return (answer)
  }

  @Post('confirm2FA')
  async confirm2FAEnable (@Body() enable2FAInfo: Enable2FAInfoDto) : Promise<string> {
    let payload : any;
    try {
      payload = jwt.verify(enable2FAInfo.token, this.authService.jwt_log_secret)
    }
    catch {
      throw new UnauthorizedException('Unauthorized - Invalid JWT token');
    }
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
      let payload:any = jwt.verify(enable2FAInfo.token, this.authService.jwt_log_secret)
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
