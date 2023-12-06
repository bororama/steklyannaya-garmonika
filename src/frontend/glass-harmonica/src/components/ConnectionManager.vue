<template>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { onMounted } from "@vue/runtime-core";
import { io, Socket } from "socket.io-client";
import { User, Messsage, ServerToClientEvents, ClientToServerEvents} from "./metaverse/meta.interface.ts";

const props = defineProps({
	metaSocket : Socket, 
});

function connectionManager (metaSocket : Socket) {		

	metaSocket.on('connect', () => {
		console.log('Connected');
	});

	metaSocket.on('chat', (payload) => { console.log('chat>>', `${payload.user.userName}:`, payload.message) }
	);

	/*metaSocket.on('playerUpdate', (player) => {
		console.log('playerMovement>>', `${payload.user.userName}:`, payload.message);
	}):*/

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