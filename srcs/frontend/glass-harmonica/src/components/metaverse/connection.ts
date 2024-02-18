import { io, Socket } from "socket.io-client";
import { type User, type Messsage, type ServerToClientEvents, type ClientToServerEvents, type Player, type LiveClient} from "./shared/meta.interface";
import { Metaverse } from "./app";
import { PlayerData } from "./playerData";
import { ref } from 'vue'
import { useRouter } from 'vue-router'


async function spawnPlayers(liveClients: Array<PlayerData>, metaverse : Metaverse) {
	liveClients.forEach(async (c) => {
		await metaverse.gameWorld.spawnPlayer(c);
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
	
	metaSocket.on('chat', (payload : Messsage) => {
		metaverse.gameWorld.makeRemotePlayerSay(payload);
	});
	
	metaSocket.on('newPlayer', async (payload : { retries : number, player : Player }) => { 
		console.log('newPLayer joined >', `${ (payload.player) ?  payload.player.user.name: 'undefined player' }`);
		if (metaverse.gameWorld.isReady()) {
			console.log("Spawning....")
			await spawnPlayers([payload.player], metaverse); // gameworld sometimes undefined??
		}
		else {
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
      console.log("GAME ENDED")
		//routerRef.push({path: '/pong_match', query:{mode: 1, id:-2}});
		metaverse.gameWorld.setLocalPlayerState(1);
	});

	metaSocket.on('stopApotheosis', (payload : string) => {
      console.log("APOTEOSIS parada")
		metaverse.gameWorld.stopApotheosis(payload);
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
