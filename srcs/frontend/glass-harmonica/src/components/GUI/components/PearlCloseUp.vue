<template>

<div class="overlay">
    <img v-if="!broken_soul" class="soul_encapsulator" src="/public/items/perla.png">
    <img class="pixelated_soul" :src="chosen_soul"/>
</div>

</template>

<script setup>

import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {backend, getRequestParams } from './connect_params.ts'

let chosen_soul = ref('')
let broken_soul = ref(false)
const route = useRoute()

onMounted(() => {
  fetch(backend + '/players/' + route.query.id, getRequestParams()).then((a) => {
    if (a.status == 200)
    {
      a.json().then((player) => {
        chosen_soul.value = backend + '/' + player.profilePic
      })
    } else {
      broken_soul = true
      let rand = Math.floor(Math.random() * 3) + 1
      chosen_soul.value = '/public/items/alma_en_pena' + rand + '.png'
    }
  }).catch((e) => {
    let rand = Math.floor(Math.random() * 3) + 1
    chosen_soul.value = '/public/items/alma_en_pena' + rand + '.png'
  })
})


</script>

<style>
.normal_title {
  font-family: joystix;
}

.normal_text {
  font-family: joystix;
}

.pixelated_soul {
  image-rendering: pixelated;
  width: 80vw;
  max-width: 80vh;
  mask-image: url(/public/items/perla.png);
  mask-size: contain;
  mask-repeat: no-repeat;
}

.soul_encapsulator {
  image-rendering: pixelated;
  width: 80vw;
  max-width: 80vh;
  position: absolute;
  z-index: +1;
  opacity: 52%;
}

</style>
