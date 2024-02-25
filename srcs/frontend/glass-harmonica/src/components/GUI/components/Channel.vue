<template>

<div :class="{user_container:true, kicked: deleted}">
    <p @click="toggle_open" id="chan_name" class="text_user">{{channel.id}}</p>
    <button @click="delete_chan" v-if="!deleted">DELETE</button>
</div>
<div class="admin_page_column" v-if="is_open && !deleted">
    <UserChannel v-for="(user,index) in channel.users" :key="index" :user="user" :chatId="channel.id"/>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UserChannel from './UserChannel.vue'
import { deleteRequestParams } from './connect_params'

export default defineComponent({
  name: 'ChannelAdmin',
  props: ['channel'],
  data () {
    return ({
      is_open: false,
      deleted: false
    })
  },
  components: {
    UserChannel
  },
  methods: {
    toggle_open () {
      this.is_open = !this.is_open
    },
    delete_chan () {
      fetch (globalThis.backend + '/admins/chatOptions/' + this.channel.id, deleteRequestParams()).then((res) => {
        if (res.status === 200 || res.status === 201) {
          this.deleted = true
        } else {
          this.$router.push('/')
        }
      });
    }
  }
})

</script>

<style>

#chan_name {
    cursor: pointer
}

</style>
