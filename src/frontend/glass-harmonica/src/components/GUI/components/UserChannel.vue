<template>

<div class="user_container">
    <p :class="{text_user: true, chan_admin: admin && !kicked, chan_kicked: kicked}">{{user.name}}</p>
    <div id="channels_admin_container" v-if="!kicked">
        <button v-if="!admin" @click="make_admin">MAKE ADMIN</button>
        <button v-if="admin" @click="demote_admin">REVOKE</button>
        <button @click="kick_user">KICK</button>
    </div>
</div>

</template>

<script lang="ts">

import { defineComponent } from 'vue'
import { backend, postRequestParams, deleteRequestParams} from './connect_params'

export default defineComponent({
  name: 'UserChannel',
  props: ['user', 'chatId'],
  data () {
    return ({
      admin: this.user.isAdmin,
      kicked: false
    })
  },
  methods: {
    make_admin () {
      fetch (backend + '/admins/chatOptions/' + this.chatId + '/raiseToAdmin/' + this.user.id, postRequestParams)
      this.admin = true
    },
    demote_admin () {
      fetch (backend + '/admins/chatOptions/' + this.chatId + '/revokeAdmin/' + this.user.id, postRequestParams)
      this.admin = false
    },
    kick_user () {
      fetch (backend + '/chats/' + this.user.id + '/' + this.chatId, deleteRequestParams)
      this.kicked = true
    }
  }
})

</script>

<style>

.chan_admin {
  color:green;
}

.chan_kicked {
  color: red;
}

#channels_admin_container {
  display: flex;
}

</style>
