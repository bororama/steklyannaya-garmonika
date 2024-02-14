<template>
    <div class="overlay">
        <textarea v-model="candidate"></textarea>
        <h3 v-if="user_does_not_exist">User does not exist</h3>
        <button @click="link_soul">Link Soul</button>
        <button @click="close">Close</button>
    </div>
</template>

<script lang="ts">

import {getRequestParams, postRequestParams} from './connect_params.ts'

export default {
  name: 'AddMemberPopup',
  props: ['chat_id'],
  data () {
    return ({
      candidate: '',
      user_does_not_exist: false
    })
  },
  methods: {
    link_soul () {
      fetch (globalThis.backend + '/chats/' + this.chat_id + '/join/' + this.candidate, postRequestParams()).then((a) => {
        if (a.status ==  400)
          this.user_does_not_exist = true
        else
          this.$emit("close_interaction")
        //  a.json((answer) => {
        //    console.log(answer)
        })
    },
    close () {
        this.$emit("close_interaction")
    }
  }
}

</script>
