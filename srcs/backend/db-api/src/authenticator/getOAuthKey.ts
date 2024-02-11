import axios from "axios";
import qs from "qs";

let id: string = 'u-s4t2ud-b16e1d817c759a4768523eda7110974f45570d769c4180e352137a7aeb4a5ee7';
let secret: string = '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';
let tokenHost: string =  'https://api.intra.42.fr/oauth/token';

let apiEndpoint: string =  'https://api.intra.42.fr/v2/me';

export const getOAuthKey = async(code) => {
    let rvalue = {
      status: 'ko',
      token: '',
      register_token: '',
      log_token: '',
      fa_token: '',
      auto_image: ''
    }
	const accessToken = await axios.post(tokenHost, 'grant_type=authorization_code'+'&client_id='+id+'&client_secret='+secret+'&code='+code+'&redirect_uri='+'http://c1r8s6.42madrid.com:5173'
	).then((res) => {
        rvalue.status = 'ok'
        rvalue.token = res.data.access_token
        return (rvalue)
	}
	).catch((error) => {
		console.log(error.message);
        return (rvalue)
	});	
    return (accessToken)
}

export const getPersonalInfo = async(token) => {
	let config = {
		headers: {
			Authorization: "Bearer " + token
		}
	};
	const data = await axios.get(apiEndpoint, config).then((res) => {
		return (res.data);
	}).catch ((error) => {
		console.log("ERRORRR: " + error);
	});
	return data;
};
