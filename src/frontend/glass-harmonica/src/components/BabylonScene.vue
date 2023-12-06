<template>
</template>

<script setup lang="ts">

import { onMounted } from "@vue/runtime-core";
import { initializeMetaverse } from "./metaverse/app.ts";
import { Socket } from 'socket.io-client'

const props = defineProps({
  metaSocket : Socket,
});

onMounted(() => {
  initializeMetaverse(props.metaSocket);
});

</script>