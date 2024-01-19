<template>

<div class="overlay">
  <h1>ADMIN PAGE</h1>

  <div class="admin_page_columns_container">
      <div class="admin_page_column" id="user_ban">
          <h3>Users</h3>
          <User v-for="(user,index) in users" :key="index" :user="user"/>
      </div>

      <div class="admin_page_column" id="user_ban">
          <h3>Channels</h3>
          <Channel v-for="(channel,index) in channels" :key="index" :channel="channel"/>
      </div>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import User from './User.vue'
import Channel from './Channel.vue'
import {backend, getRequestParams} from './connect_params'

export default defineComponent({
  name: 'AdminPage',
  components: {
    User,
    Channel
  },
  data () {
    return {
      users: [{}],
      channels: [{}]
    }
  },
  created() {
    fetch(backend + '/users', getRequestParams).then((a) => {
      a.json().then((users) => {
        for (const user in users) {
          let u = users[user]
          fetch (backend + '/players/' + u.id + '/banned').then((a) => {
            a.text().then((isBanned) => {
                this.users.push(u)
            })
          })
        }
      })
    })
    fetch(backend + '/admins/getChatsAndMembers', getRequestParams).then((a) => {
      a.json().then((chats) => {
        for (const chat in chats) {
          let c = chats[chat]
          this.channels.push(c)
        }
      })
    })
  }
})

</script>

<style>

.admin_page_column {
  display: flex;
  flex-direction:column;
  margin: 0 5%;
}

#user_ban {
    width: 30vw;
}

.admin_page_columns_container {
  display: flex;
}

</style>
