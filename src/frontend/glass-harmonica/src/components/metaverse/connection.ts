import { io, Socket } from "socket.io-client";
import { type User, type Messsage, type ServerToClientEvents, type ClientToServerEvents, type Player} from "./shared/meta.interface";
import { Metaverse } from "./app";
import { PlayerData } from "./playerData";
import { getRandomUsername } from "./utils";

globalThis.username = getRandomUsername();

function connectionManager (metaSocket : Socket, metaverse : Metaverse) {		

	console.log("socket is ", metaSocket);
	metaSocket.on('connect', () => {
		console.log('Connected');
		setTimeout( () => {
			metaSocket.emit('userData', globalThis.username);
		}, 1)
	});
	
	metaSocket.on('welcomePack', async (payload : { newPlayer : Player, livePlayers : Array<Player>}) => {
		console.log('welcomePack>>', payload)
		await metaverse.initPlayerData(
			payload.newPlayer.user.locator,
			payload.newPlayer.user.name
		);
		await metaverse.initGameWorld(metaSocket);
		metaverse.gameWorld.spawnPlayers(payload.livePlayers);
	});
 
	metaSocket.on('chat', (payload : Messsage) => { 
		console.log('chat>>', `${payload.user.name}:`, payload.message);
		metaverse.gameWorld.makeRemotePlayerSay()
	});
	
	metaSocket.on('newPlayer', (payload : Player) => { 
		console.log('newPLayer joined ....>>', `${payload.user.name}:`, payload.message);
		metaverse.gameWorld.spawnPlayers([payload]);
	});

	metaSocket.on('playerUpdate', (payload : Player) => {
		console.log('playerMovement>>', `${payload.user.name} position: `, payload.position[0], payload.position[1], payload.position[2]);
		metaverse.gameWorld.applyRemotePlayerUpdate(payload);
	});

	metaSocket.on('exception', (data) => {
		console.log('event', data);
	});

	metaSocket.on('disconnect', () => {
		console.log('Disconnected');
	});
}

export {connectionManager};
