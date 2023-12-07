<template>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { onMounted } from "@vue/runtime-core";
import { io, Socket } from "socket.io-client";
import { User, Messsage, ServerToClientEvents, ClientToServerEvents, Player} from "./metaverse/meta.interface.ts";

const props = defineProps({
	metaSocket : Socket, 
});

function connectionManager (metaSocket : Socket) {		

	metaSocket.on('connect', () => {
		console.log('Connected');
	});

	metaSocket.on('chat', (payload : Messsage) => { 
		console.log('chat>>', `${payload.user.name}:`, payload.message) 
	});

	metaSocket.on('playerUpdate', (payload : Player) => {
		console.log('playerMovement>>', `${payload.user.name} position: `, payload.position[0], payload.position[1], payload.position[2]);
	});

	metaSocket.on('exception', (data) => {
		console.log('event', data);
	});

	metaSocket.on('disconnect', () => {
		console.log('Disconnected');
	});
}

onMounted(() => {
    connectionManager(props.metaSocket);
}); 

</script>