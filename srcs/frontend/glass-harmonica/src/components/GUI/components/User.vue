<template>

<div class="user_container">
    <p :class="{text_user: true, banned: is_banned}">{{user.name}}</p>
    <button v-if="!is_banned" @click="ban">BAN</button>
    <button v-if="is_banned" @click="unban">UNBAN</button>
    <button v-if="!is_admin" @click="make_admin">MAKE ADMIN</button>
    <button v-if="is_admin" @click="unmake_admin">DEMOTE ADMIN</button>
</div>

</template>

<script lang="ts">

import { defineComponent } from 'vue'
import {postRequestParams, deleteRequestParams} from './connect_params.ts'

export default defineComponent({
  name: 'UserAdmin',
  props: ['user'],
  data () {
    return ({
      is_banned: this.user.banned,
      is_admin: this.user.isAdmin
    })
  },
  methods: {
    ban () {
      fetch (globalThis.backend + '/admins/' + globalThis.id + '/ban/' + this.user.id, postRequestParams())
      this.is_banned = true
    },
    unban () {
      fetch (globalThis.backend + '/admins/unban/' + this.user.id, postRequestParams())
      this.is_banned = false
    }, 
    make_admin () {
      fetch (globalThis.backend + '/admins/' + this.user.id, postRequestParams())
      this.is_admin = true
    },
    unmake_admin() {
      fetch (globalThis.backend + '/admins/' + this.user.id, deleteRequestParams())
      this.is_admin = false
    }
  },
  created () {
    console.log("AHHH")
    console.log(this.user)
  }
})

</script>

<style>

.banned {
  color:grey;
}

.user_container {
  display: flex;
}

.text_user {
  margin: 0.6em 1em;
}

</style>
