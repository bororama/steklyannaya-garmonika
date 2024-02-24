<template>
    <button v-if="offer_taken">Take offering</button>
    <button v-if="!offer_taken">Return offering</button>
</template>

<script setup>

import { ref, onMounted } from 'vue'

import { backend, getRequestParams } from './connect_params.ts'

const props = defineProps(['chat'])

let offer_taken = ref(false)

onMounted(() => {
  check_if_offering_was_taken()
})

async function check_if_offering_was_taken() {
  fetch (backend + '/chats/' + chat.id + '/users')
}

</script>
