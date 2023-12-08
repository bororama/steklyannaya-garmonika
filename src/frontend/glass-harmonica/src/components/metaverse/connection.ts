import { io, Socket } from "socket.io-client";
import { type User, type Messsage, type ServerToClientEvents, type ClientToServerEvents, type Player} from "./shared/meta.interface";
import { Metaverse } from "./app";
import { PlayerData } from "./playerData";


function connectionManager (metaSocket : Socket, metaverse : Metaverse) {		

	console.log("socket is ", metaSocket);
	metaSocket.on('connect', () => {
		console.log('Connected');
	});

	metaSocket.on('chat', (payload : Messsage) => { 
		console.log('chat>>', `${payload.user.name}:`, payload.message) 
	});
	
	metaSocket.on('newPlayer', (payload : Player) => { 
		console.log('chat>>', `${payload.user.name}:`, payload.message)
		PlayerData.numberOfPlayers++
	});

	metaSocket.on('playerUpdate', (payload : Player) => {
		console.log('playerMovement>>', `${payload.user.name} position: `, payload.position[0], payload.position[1], payload.position[2]);
		console.log("meta ", metaverse);
        metaverse.test();
	});

	metaSocket.on('exception', (data) => {
		console.log('event', data);
	});

	metaSocket.on('disconnect', () => {
		console.log('Disconnected');
	});
}

export {connectionManager};
