<template>
  QR^20-berserk
</template>

<script setup lang="ts">

import { onMounted } from "@vue/runtime-core";
import { initializeMetaverse } from "./metaverse/app.ts";
import { io, Socket } from 'socket.io-client'
import { connectionManager} from "./metaverse/connection"

function initializeSocket(hostAddress : string) : Socket {
  return io<ServerToClientEvents, ClientToServerEvents>(hostAddress);
}

const hostAddress = `http://${import.meta.env.VITE_HOST_IP}:3000`;
const metaSocket = initializeSocket(hostAddress, );
const localPlayerData = 

onMounted(async () => {
  const metaverseInstance : Metaverse = await initializeMetaverse(metaSocket);
  connectionManager(metaSocket, metaverseInstance);
});

</script>