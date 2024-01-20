<template>
    <ATalkWithGod @god_finished_speaking="start_register" v-if="listening_to_god"/>
    <button v-if='!in_metaverse && profile_state != "no" && profile_state != "registering"' @click="close_profile" class="fa_button">Close Profile</button>
    <button v-if='!in_metaverse && in_admin_page' @click="close_admin_page" class="fa_button">Close Admin</button>
    <ProfilePage v-if="profile_state != 'no'" :display_status="profile_state" :register_token="register_token" :auto_image="auto_image" @successful_register="go_to_metaverse"/>
    <CookieChecker @register="listen_to_god" @log_success="go_to_metaverse"/>
    <button class="fa_button" v-if='in_metaverse && profile_state === "no"' @click="open_profile">See Profile</button>
    <ButtonedInventory v-if="in_metaverse" @inventory_open="open_inventory" @inventory_close="close_inventory" @go_to_pong_match="(param) => {$emit('go_to_pong_match', param)}"/>
    <AdminPage v-if="in_admin_page"/>
    <button class="fa_button float_right" v-if='in_metaverse && profile_state === "no"' @click="open_admin_page">AdminPage</button>
    <AlreadyConnected v-if="false"/>
    <Home/>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ProfilePage from './ProfilePage.vue'
import AdminPage from './AdminPage.vue'
import CookieChecker from './CookieChecker.vue'
import ButtonedInventory from './ButtonedInventory.vue'
import ATalkWithGod from './ATalkWithGod.vue'
import AlreadyConnected from './AlreadyConnected.vue'
import Home from '../../Home.vue'
import Shop from './Shop.vue'
import Leaderboard from './Leaderboard.vue'

export default defineComponent({
  name: 'GUI',
  components: {
    ProfilePage,
    AdminPage,
    CookieChecker,
    ButtonedInventory,
    ATalkWithGod,
    AlreadyConnected,
    Home,
    Shop,
    Leaderboard
  },
  data () {
    return ({
      profile_state: 'no',
      register_token: '',
      in_metaverse: false,
      in_admin_page: false,
      log_token: '',
      auto_image: '',
      listening_to_god: false,
      access: {register_token: '',
                auto_image: ''}
    })
  },
  methods: {
    listen_to_god(access: any) {
      this.listening_to_god = true
      this.access = access
    },
    start_register () {
      this.listening_to_god = false
      console.log('started')
      this.register_token = this.access.register_token
      this.auto_image = this.access.auto_image
      this.profile_state = 'registering'
    },
    go_to_metaverse (logToken : string) {
      this.profile_state = 'my_profile'
      this.in_metaverse = false
      this.log_token = logToken
    },
    open_profile () {
      this.profile_state = 'my_profile'
      this.in_metaverse = false
    },
    close_profile () {
      this.profile_state = 'no'
      this.in_metaverse = true
    },
    open_inventory () {
      this.profile_state = 'no'
    },
    close_inventory () {
    //  this.in_metaverse = true
    },
    open_admin_page () {
      this.in_metaverse = false
      this.in_admin_page = true
    },
    close_admin_page () {
      this.in_admin_page = false
      this.in_metaverse = true
    }
  }
})
</script>

<style>

:root {
  --border_color: #603f22;
  --pop_background: #392919;
  --select_light: #85d8e5d0;
}

@font-face {
  font-family: 'joystix';
  src: url('~@/assets/fonts/joystix_monospace.otf') format('opentype');
}

#app {
  text-align: center;
  font-family: monospace;
  color: white;
}

body {
  background-color: #392919d5
}
</style>
