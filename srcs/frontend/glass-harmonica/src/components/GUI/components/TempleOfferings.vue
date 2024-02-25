<template>
<div class="overlay-4">
    <h3 class="temple_title" >Offerings left</h3>
</div>
<div class="temple_background"> </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRequestParams, backend } from './connect_params.ts'

import Offering from './Offering.vue'

let public_offerings = ref([])

let router = useRouter()

onMounted(() => {
  watch_offerings()
})

async function watch_offerings() {
  fetch (backend + '/getPublicChats', getRequestParams()).then((a) => {
    if (a.status != 200) {
//      router.push('/')
    } else {
      a.json().then((answer) => {
        for (a in answer) {
          public_offerings.value.push(answer[a])
        }
      })
    }
  })
}

</script>

<style>

.temple_title {
  font-family: joystix;
}

.temple_background {
  width: 100vw;
  height: 100vh;
  background-color: #d4fffb;
  z-index: 1;
  position: absolute;
  opacity: 0.3;
}
</style>
