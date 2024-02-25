import { io, Socket } from "socket.io-client";
import { type User, type Messsage, type ServerToClientEvents, type ClientToServerEvents, type Player, type LiveClient} from "./shared/meta.interface";
import { Metaverse } from "./app";
import { PlayerData } from "./playerData";
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getRequestParams, backend } from "../GUI/components/connect_params";


async function spawnPlayers(liveClients: Array<PlayerData>, metaverse : Metaverse) {
	// await for blocked user array then for each liveClient, check if their blocked, if so send this info to spawnPlayer()
	const response  = await fetch( globalThis.backend + '/' + globalThis.id.toString() + '/blocks', getRequestParams());
	const blockedUsers = await response.json();


	liveClients.forEach(async (c) => {
		const isBlocked = blockedUsers.some((u) => {
			return (u.id.toString() === c.user.id)
		});
		await metaverse.gameWorld.spawnPlayer(c, isBlocked);
	});
}


async function spawningRoutine(metaSocket : Socket, metaverse: Metaverse, livePlayers : Array<PlayerData>, retries : number) {
	
	console.log("spawnExistingPlayers()", " retries() : ", retries);
	let completeLivePlayers : boolean = true;
	if (retries > 0) {
		metaverse.gameWorld.resetLivePlayers();
	}
	setTimeout(async () => {
		livePlayers.forEach( (p) => {
			if (p == null) {
				completeLivePlayers = false;
				return ;
			}
		});
		if (completeLivePlayers) {
			spawnPlayers(livePlayers, metaverse);
		}
		else {
			const payload = "NULL PLAYER FOUND";
			metaSocket.emit('spawnExistingPlayersFailed', payload, (newLivePlayers : any) => {
				console.table(newLivePlayers);
				spawningRoutine(metaSocket, metaverse, newLivePlayers, retries + 1);
			});
		}
	}, 300 + (Math.pow(retries, 2) * 100));
}

function connectionManager (metaSocket : Socket, metaverse : Metaverse, routerRef : any) {		

	metaSocket.on('connect', () => {
		//setTimeout( () => {
			//why is globalThis.id a number??????
			metaSocket.emit('userData', { id : globalThis.id + '', name : globalThis.username});
		//}, 1)
	});
	
	metaSocket.on('welcomePack', async (payload : { newPlayer : Player, livePlayers : Array<PlayerData>}) => {
		console.log('WelcomePack >>');
		await metaverse.initPlayerData(
			payload.newPlayer.user.id,
			payload.newPlayer.user.name
		);
		await metaverse.initGameWorld(metaSocket);
		console.table(payload.livePlayers);
		spawningRoutine(metaSocket, metaverse, payload.livePlayers, 0);
	});
	
	metaSocket.on('alreadyJoined', () => {
		alert("This account is already instanced on the curroverse...");
	});

	metaSocket.on('chat', (payload : Messsage) => {
		metaverse.gameWorld.makeRemotePlayerSay(payload);
	});
	
	metaSocket.on('newPlayer', async (payload : { retries : number, player : Player }) => { 
		console.log('newPLayer joined >', `${ (payload.player) ?  payload.player.user.name: 'undefined player' }`);
		if (metaverse.gameWorld.isReady()) {
			console.log("Spawning new player....")
			await spawnPlayers([payload.player], metaverse); // gameworld sometimes undefined??
		}
		else {
			console.log("spawn failed....");
			metaSocket.emit('spawnNewPlayerFailed', {retries : payload.retries, player : payload.player});
		}
	});

	metaSocket.on('playerLeft', (payload : Player) => { 
		console.log('Player left ....>>', `${payload.user.name}`);
		metaverse.gameWorld.removePlayer(payload);
	});

	metaSocket.on('playerUpdate', async ( payload : Player) => {
		//console.log('playerUpdate>>', `${payload.user.name} position: `, payload.position[0], payload.position[1], payload.position[2], " state : ", payload.state);
		metaverse.gameWorld.applyRemotePlayerUpdate(payload); // <--promise is failing
	});


	metaSocket.on('gameStart', async () => {
      console.log("Started")
		routerRef.push({path: '/pong_match', query:{mode: 0, id:-2}});
	});
	
	metaSocket.on('apotheosis', (payload : string) => {
		metaverse.gameWorld.apotheosis(payload);
	});

	metaSocket.on('gameEnd', async () => {
		metaverse.gameWorld.setLocalPlayerState(1);
	});

	metaSocket.on('stopApotheosis', (payload : string) => {
      console.log("APOTEOSIS parada")
		metaverse.gameWorld.stopApotheosis(payload);
	});

	metaSocket.on('name', (payload : any) => {
		if (payload.id == globalThis.id) {
			console.log("change local player name");
			metaverse.gameWorld.changeLocalPlayerName(payload.newName);
		}
		else {
			metaverse.gameWorld.changeRemotePlayerName(payload.id, payload.newName);
		}
	});

	metaSocket.on('blockUser', (payload : any) => {
		metaverse.gameWorld.blockRemotePlayer(payload.blockedUserId);
	});

	metaSocket.on('unblockUser', (payload : any) => {
		metaverse.gameWorld.unblockRemotePlayer(payload.blockedUserId);
	});

	metaSocket.on('exception', (data) => {
		console.log('event', data);
	});


	metaSocket.on('banned', () => {
		console.log("B A N N E D");
		metaverse.gameWorld.showPopUp("Away with you, cursed one, into the eternal fire.", false);
		metaverse.gameWorld.resetLivePlayers();
	})

	metaSocket.on('disconnect', () => {
		console.log('Disconnected');
		metaverse.gameWorld.resetLivePlayers();
	});
}

export {connectionManager};
