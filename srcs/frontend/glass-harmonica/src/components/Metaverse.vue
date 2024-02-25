<style>
  .outer-darkness {
    height: 100vh; width: 100vw; position: absolute; top: 0; left: 0; z-index: -1; background-size:
  contain;
  background-image: url("/GUI_assets/outer_darkness.gif");
  }
</style>

<template>
	<!--PongGame :meta-socket="metaSocket" :modo="0" :pong-room-id="-2"  v-if="match" @closeGame="closeGame"/-->
  <div class="outer-darkness">
  </div>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { onMounted } from "@vue/runtime-core";
import { initializeMetaverse } from "./metaverse/app.ts";
import { io, Socket } from 'socket.io-client';
import { connectionManager} from "./metaverse/connection";
import DummyGame  from "./DummyGame.vue";
import PongGame from "./GUI/components/PongGame.vue";
import { useRouter } from 'vue-router'



function initializeSocket(hostAddress : string) : Socket {
  return io<ServerToClientEvents, ClientToServerEvents>(hostAddress);
}

const hostAddress = `http://${process.env.HOST}:777`;
//const metaSocket = initializeSocket(hostAddress, );
const vueEmitter = defineEmits(['profileRequest', 'storeRequest']);
const match = ref(false);
const router = useRouter();

onMounted(async () => {
  globalThis.metaSocket = initializeSocket(hostAddress, );
  const metaverseInstance : Metaverse = await initializeMetaverse(globalThis.metaSocket, vueEmitter);
  connectionManager(globalThis.metaSocket, metaverseInstance, router);
});

function closeGame() {
  match.value = false;
}

</script>
