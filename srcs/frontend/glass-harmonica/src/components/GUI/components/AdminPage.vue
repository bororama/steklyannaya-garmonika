<template>

<div class="overlay">
  <h1 style="font-family: 'joystix'">ADMIN PAGE</h1>
  <h1 v-if="you_are_not_admin">YOU ARE NOT ADMIN</h1>

  <div v-if="!you_are_not_admin" class="admin_page_columns_container">
      <div class="admin_page_column" id="user_ban">
          <h3 style="text-align: center">Users</h3>
          <div style="max-height: 800px;overflow-y: auto;;max-width: 750px;">
           <User v-for="(user,index) in users" :key="index" :user="user"/> 
          </div>
          
      </div>

      <div class="admin_page_column" id="user_ban">
          <h3>Channels</h3>
          <div style="max-height: 800px;overflow-y: auto;;max-width: 750px;">
            <Channel v-for="(channel,index) in channels" :key="index" :channel="channel"/>
  
          </div>
      </div>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import User from './User.vue'
import Channel from './Channel.vue'
import {getRequestParams} from './connect_params'

export default defineComponent({
  name: 'AdminPage',
  components: {
    User,
    Channel
  },
  data () {
    return {
      users: [{}],
      channels: [{}],
      you_are_not_admin: true
    }
  },
  created() {
    fetch(globalThis.backend + '/players', getRequestParams()).then((a) => {
      a.json().then((users) => {
        for (const user in users) {
          let u = users[user]
          fetch (globalThis.backend + '/players/' + u.id + '/banned', getRequestParams()).then((a) => {
            a.text().then((isBanned) => {
              u.banned = (isBanned == 'true');
              this.users.push(u)
            })
          })
        }
        this.users.splice(0, 1)
      })
    })
    fetch(globalThis.backend + '/admins/getChatsAndMembers', getRequestParams()).then((a) => {
      if (a.status != 200) {
          this.you_are_not_admin = true
      } else {
        a.json().then((chats) => {
          this.you_are_not_admin = false
          for (const chat in chats) {
            let c = chats[chat]
            if (c.is_friend_chat != true) {
                this.channels.push(c)
            }
          }
          this.channels.splice(0, 1)
        })
      }
    })
  }
})

</script>

<style>

.admin_page_column {
  display: flex;
  flex-direction:column;
  align-items: center;
  margin: 0 auto;
}

#user_ban {
    width: 30vw;
}

.admin_page_columns_container {
  margin: 0 auto;
  display: flex;  
  flex-direction:row;
  font-family: 'joystix';
}

</style>
