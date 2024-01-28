<template>
    <div class="overlay">
        <h3>User to ban</h3>
        <textarea v-model="candidate"></textarea>
        <h3 v-if="user_does_not_exist">User does not exist</h3>
        <h3>Ban Minutes</h3>
        <input v-model="minutes" type="number"/>
        <h3 v-if="not_a_number">Not a valid time</h3>
        <button @click="ban">Ban</button>
        <button @click="close">Close</button>
    </div>
</template>

<script lang="ts">

import {backend, getRequestParams, postRequestParams} from './connect_params.ts'

export default {
  name: 'BanTimeUser',
  props: ['chat_id'],
  data () {
    return ({
      minutes: '',
      user_does_not_exist: false
    })
  },
  methods: {
    ban () {
      let param = postRequestParams()
      param.body = JSON.stringify({
        "time": this.minutes
      })
      fetch (backend + '/chats/' + this.chat_id + '/admins/' + globalThis.id + '/ban/' + this.candidate, param).then((a) => {
        console.log(a)
      })
    },
    close () {
        this.$emit("close_interaction")
    }
  }
}

</script>
