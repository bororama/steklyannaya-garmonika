<template>
	<DummyGame :meta-socket="metaSocket" v-if="match" />
  QR^20-berserk
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { onMounted } from "@vue/runtime-core";
import { initializeMetaverse } from "./metaverse/app.ts";
import { io, Socket } from 'socket.io-client';
import { connectionManager} from "./metaverse/connection";
import DummyGame  from "./DummyGame.vue";



function initializeSocket(hostAddress : string) : Socket {
  return io<ServerToClientEvents, ClientToServerEvents>(hostAddress);
}

const hostAddress = `http://${import.meta.env.VITE_HOST_IP}:777`;
const metaSocket = initializeSocket(hostAddress, );
const vueEmitter = defineEmits(['profileRequest', 'storeRequest']);
const match = ref(false);

onMounted(async () => {
  const metaverseInstance : Metaverse = await initializeMetaverse(metaSocket, vueEmitter);
  connectionManager(metaSocket, metaverseInstance, match);
});

</script>