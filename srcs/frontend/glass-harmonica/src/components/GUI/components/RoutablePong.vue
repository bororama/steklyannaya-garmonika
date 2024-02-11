<template>
    <PongGame v-if="loaded" :modo="match_mode" :pong-room-id="room_id" @match_finish="close_match" @closeGame="close_match"/>
</template>

<script setup>
import PongGame from './PongGame.vue'

import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

let loaded=ref(false)
let room_id=ref(0)
let match_mode=ref(0)
let route = useRoute()
let router = useRouter()

onMounted (() => {
  room_id.value = route.query.id
  match_mode.value = route.query.mode
  loaded.value = true
})

function close_match() {
  router.push('/')
}

</script>
