import { Injectable } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class FtOauthService {
	private readonly id: string;
	private readonly secret: string;
	private readonly ftApiHost: string = 'https://api.intra.42.fr';
	private readonly getTokenEndpoint: string = this.ftApiHost + '/oauth/token';
	private readonly getInfoEndpoint: string =  this.ftApiHost + '/v2/me';
	private readonly host: string;
	private readonly port: string
	
	constructor(
		private readonly configService: ConfigService,
	) {
		this.id = this.configService.get('UID');
		this.secret = this.configService.get('SECRET');
		this.host = this.configService.get('HOST');
		this.port = this.configService.get('FRONTEND_PORT');
	}

	async getOAuthKey(code: string): Promise<any>
	{
		let rvalue = {
			status: 'ko',
			token: '',
			register_token: '',
			log_token: '',
			fa_token: '',
			auto_image: ''
		}

		const urlInfo: string = 'grant_type=authorization_code'
							+ '&client_id=' + this.id
							+ '&client_secret=' + this.secret
							+ '&code=' + code
							+ '&redirect_uri=http://' + this.host
							+ (+this.port != 80 ? ':' + this.port : '');
		const accessToken = await axios.post(this.getTokenEndpoint, urlInfo)
		.then((res) => {
			rvalue.status = 'ok'
			rvalue.token = res.data.access_token
			return (rvalue)
		})
		.catch((error) => {
			console.log(error.message);
			return (rvalue)
		});	
		return (accessToken)
	}

	async getPersonalInfo(token: string): Promise<any>
	{
		let config = {
			headers: {
				Authorization: "Bearer " + token
			}
		};
		const data = await axios.get(this.getInfoEndpoint, config).then((res) => {
			return (res.data);
		}).catch ((error) => {
			console.log("ERRORRR: " + error);
		});
		return data;
	};
}