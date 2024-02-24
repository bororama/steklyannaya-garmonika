<template>
    <div class="overlay">
      <div class="ban-container">
        <h3>User to ban</h3>
        <textarea v-model="candidate"></textarea>
        <h3 v-if="user_does_not_exist">User does not exist</h3>
        <h3>Ban Minutes</h3>
        <input v-model="minutes" type="number"/>
        <h3 v-if="not_a_number">Not a valid time</h3>
        <button class="fa_button" @click="ban">Ban</button><br>     
      </div>
      <button class="fa_button" @click="close">Close</button>   
    </div>
</template>

<script lang="ts">

import {getRequestParams, postRequestParams} from './connect_params.ts'

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
      fetch (globalThis.backend + '/chats/' + this.chat_id + '/admins/' + globalThis.id + '/ban/' + this.candidate, param).then((a) => {
        console.log(a)
      })
    },
    close () {
        this.$emit("close_interaction")
    }
  }
}

</script>

<style>

.ban-container{
  font-family: 'joystix';
}

</style>