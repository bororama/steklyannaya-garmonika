<template>
    <button v-if="!offer_taken" class="fa_button" @click="take">Take offering</button>
    <button v-if="offer_taken" class="fa_button" @click="leave">Return</button>
    <div>
        <img class="fondo_objeto" src="/items/fondo_objeto.png">
        <img class="item_image" src="/items/collar.png" @click="toggle_user_show">
        <p v-if="showing_users" class="public_chat_user" v-for="(name, index) in users" :key="index">{{name}}</p>
    </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'

import { backend, getRequestParams, postRequestParams, deleteRequestParams} from './connect_params.ts'

const props = defineProps(['chat'])

let offer_taken = ref(false)
let users = ref([])
let showing_users = ref(false)
let user_is_owner = ref(false)

onMounted(() => {
  check_if_offering_was_taken()
})

async function check_if_offering_was_taken() {
  users.value = []
  fetch (backend + '/chats/' + props.chat.id + '/users', getRequestParams()).then((a) => {
    a.json().then((answer) => {
      let user_is_in_chat = false
      for (const u in answer) {
        if (answer[u].id == globalThis.id) {
          user_is_in_chat = true
        }
        users.value.push(answer[u].name)
      }
      if (user_is_in_chat) {
        offer_taken.value = true
      } else {
        offer_taken.value = false
      }
    })
  })
}

function toggle_user_show() {
  showing_users.value = !(showing_users.value)
}

function take() {
  fetch(backend + '/chats/' + props.chat.id + '/join/' + globalThis.id, postRequestParams()).then(() => {
    check_if_offering_was_taken()
  })

}

function leave() {
  fetch(backend + '/chats/' + props.chat.id + '/' + globalThis.id, deleteRequestParams()).then(() => {
    check_if_offering_was_taken()
  })
}

</script>

<style>

.public_chat_user  {
  font-family: joystix;
  text-shadow: #000000 2px 2px;
}

</style>
