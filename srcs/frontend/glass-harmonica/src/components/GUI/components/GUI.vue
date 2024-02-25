<template>
    <CookieChecker @register="listen_to_god" @log_success="go_to_metaverse" @already_connected="go_to_alredy_connected_page"/>
    <!--div class="overlay" v-if="showing_profile_image">
        <ProfilePage display_status="profile_display" :userId="meta_colleague_id" :unmatchable="true"/>
        <button class="fa_button" @click="close_profile">Close Profile</button>
    </div-->
    <router-view></router-view>
    <MetaOverlay v-if="in_metaverse"/>
    <Metaverse v-if="in_metaverse" @profileRequest="metaProfileHandler" @storeRequest="storeHandler"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CookieChecker from './CookieChecker.vue'
import Metaverse from '../../Metaverse.vue'
import MetaOverlay from './MetaOverlay.vue'
import ProfilePage from './ProfilePage.vue'
import { backend, getRequestParams } from './connect_params.ts'
import Shop from './Shop.vue'
import { Socket, io } from "socket.io-client";
import {getRandomUsername, numberIsInRange} from './metaverse/utils';
import { useRouter } from 'vue-router';


export default defineComponent({
  name: 'GUI',
  components: {
    CookieChecker,
    Metaverse,
    MetaOverlay,
    ProfilePage,
    Shop,
   },
  data () {
    return ({
      register_token: '',
      in_store: false,
      in_metaverse: false,
      auto_image: '',
      showing_profile_image: false,
      meta_colleague_id: '',
      already_connnected: false,
    })
  },
  methods: {
    listen_to_god(access: any) {
      this.$router.push({path: '/register', query: {auto_image: access.auto_image, register_token:access.register_token}})
    },
    go_to_metaverse (logToken : string) {
      fetch (globalThis.backend + '/log/me/', {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + logToken
        }
      }).then((a) => {
        a.json().then((player) => {
          globalThis.id = player.id
          globalThis.my_data = player
          globalThis.username = player.name
          globalThis.is_admin = player.isAdmin
          globalThis.logToken = logToken
          this.in_metaverse = true
        })
      })
    },
    metaProfileHandler (profile) {
      console.log(profile)
      this.$router.push({path: "/profile_view", query: {id: profile.name}})
    },
    storeHandler () {
      this.$router.push('/shop')
    },
    close_profile() {
      this.showing_profile_image = false
    },
    go_to_alredy_connected_page () {
      this.already_connected = true
    },
    closeShop() {
      this.$router.push('/')
    },
  }
})
</script>

<style>


body {
  background-color: #392919d5
}

.overlay {
	width: 100vw;
	height: 100vh;
	position:absolute;
	top: 0;
	left:0;
    z-index: 9;
    background : url('/GUI_assets/pattern.png');
    background-repeat: repeat;
    background-size: 15%;
    padding: 32px;
}

.overlay::before{
    content: '';
    background: radial-gradient(circle, rgba(246,246,0,0.27493004037552526) 4%, rgba(255,73,0,0.4429972672662815) 29%, rgba(255,214,0,0.43459390592174374) 73%, rgba(192,0,255,0.49341743533350846) 100%);
    width: 100vw;
	height: 100vh;
	position:absolute;
	top: 0;
	left:0;
    z-index: -1;
}

.overlay-2 {
	width: 100vw;
	height: 100vh;
	position:absolute;
	top: 0;
	left:0;
  z-index: 9;
  background : url('/GUI_assets/heaven.png');
  background-size: contain;
  background-position: center center;
  image-rendering: pixelated;
  background-repeat:repeat
}

.overlay-2::before{
  content: '';
  background: radial-gradient(circle, rgba(255,255,255,0) 47%, rgba(209,254,255,1) 77%, rgba(255,255,255,1) 94%);
  width: 100vw;
	height: 100vh;
	position:absolute;
	top: 0;
	left:0;
  z-index: -1;
}

.overlay-3 {
	width: 100vw;
	height: 100vh;
	position:absolute;
	top: 0;
	left:0;
  z-index: 9;
  background : url('/GUI_assets/money_power_respect.png');
  background-size: contain;
  background-position: center center;
  image-rendering: pixelated;
  background-repeat:repeat
}

.overlay-3::before{
  content: '';
  background: radial-gradient(circle, rgba(255,255,255,0) 47%, rgb(255, 247, 0) 77%, rgba(255,255,255,1) 94%);
  width: 100vw;
	height: 100vh;
	position:absolute;
	top: 0;
	left:0;
  z-index: -1;
}

.overlay-4 {
	width: 100vw;
	height: 100vh;
	position:absolute;
	top: 0;
	left:0;
  z-index: 9;
  background : url('/GUI_assets/dithered-cathedral.png');
  background-size: contain;
  background-position: center center;
  image-rendering: pixelated;
  background-repeat:repeat
}

</style>
