import { io, Socket } from "socket.io-client";
import { type User, type Messsage, type ServerToClientEvents, type ClientToServerEvents, type Player, type LiveClient} from "./shared/meta.interface";
import { Metaverse } from "./app";
import { PlayerData } from "./playerData";

async function spawnPlayers(livePlayers: Array<PlayerData>, metaverse : Metaverse) {
	metaverse.gameWorld.spawnPlayers(livePlayers);
}

function connectionManager (metaSocket : Socket, metaverse : Metaverse) {		

	metaSocket.on('connect', () => {
		//setTimeout( () => {
			console.log("CONNECTION REQUESTED")
			metaSocket.emit('userData', globalThis.username);
		//}, 1)
	});
	
	metaSocket.on('welcomePack', async (payload : { newPlayer : Player, livePlayers : Array<LiveClient>}) => {
		console.log('WelcomePack >>');
		let completeLivePlayers : boolean = true;
		await metaverse.initPlayerData(
			payload.newPlayer.user.locator,
			payload.newPlayer.user.name
		);
		await metaverse.initGameWorld(metaSocket);
		console.table(payload.livePlayers);
		payload.livePlayers.forEach( (p) => {
			if (p == null) {
				console.log("NULL PLAYER");
				metaSocket.emit('spawnFailed', {retries : 0, problemPlayer : null});
				completeLivePlayers = false;
				return ;
			}
		});
		if (completeLivePlayers) {
			spawnPlayers(payload.livePlayers, metaverse);
		}
	});
	
	metaSocket.on('chat', (payload : Messsage) => {
		metaverse.gameWorld.makeRemotePlayerSay(payload);
	});
	
	metaSocket.on('newPlayer', (payload : { retries : number, player : Player }) => { 
		console.log('newPLayer joined ....>>', `${payload}:`);
		console.log("newPlayer] metaverse is game world ready ? ", metaverse.gameWorldIsReady);
		console.log(">>", metaverse.gameWorld, "<<");
		if (metaverse.gameWorldIsReady) {
			spawnPlayers([payload.player], metaverse); // gameworld sometimes undefined??
		}
		else {
			metaSocket.emit('spawnFailed', {retries : payload.retries, problemPlayer : payload.player});
		}
	});

	metaSocket.on('playerLeft', (payload : Player) => { 
		//console.log('Player left ....>>', `${payload.user.name}`);
		metaverse.gameWorld.removePlayer(payload);
	});

	metaSocket.on('playerUpdate', async ( payload : Player) => {
		//console.log('playerUpdate>>', `${payload.user.name} position: `, payload.position[0], payload.position[1], payload.position[2], " state : ", payload.state);
		metaverse.gameWorld.applyRemotePlayerUpdate(payload); // <--promise is failing
	});

	metaSocket.on('exception', (data) => {
		console.log('event', data);
	});

	metaSocket.on('disconnect', () => {
		console.log('Disconnected');
		//metaverse.gameWorld.
	});
}

export {connectionManager};
