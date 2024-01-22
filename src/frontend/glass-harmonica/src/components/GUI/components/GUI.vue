<template>
    <CookieChecker @register="listen_to_god" @log_success="go_to_metaverse" @already_connected="go_to_alredy_connected_page"/>
    <ATalkWithGod @god_finished_speaking="start_register" v-if="listening_to_god"/>
    <!-- REGISTER PROFILE PAGE -->
    <ProfilePage v-if="profile_state == 'registering'" :display_status="profile_state" :auto_image="auto_image" :register_token="register_token" @successful_register="go_to_metaverse"/>
    <div class="overlay" v-if="showing_profile_image">
        <!-- RAYS IN METAVERSE PROFILE PAGE -->
        <ProfilePage display_status="profile_display" :userId="meta_colleague_id" @start_match="go_to_pong_match" :unmatchable="true"/>
        <button class="fa_button" @click="close_profile">Close Profile</button>
    </div>
    <PongGame v-if="in_match" :modo="match_mode" :pong-room-id="room_id" @match_finish="close_match"/>
    <Shop v-if="in_store" @closeShop="closeShop"/>
    <AlreadyConnected v-if="false"/>
  	<router-view></router-view>
    <MetaOverlay v-if="in_metaverse"/>
    <Metaverse v-if="in_metaverse" @profileRequest="metaProfileHandler" @storeRequest="storeHandler"/>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CookieChecker from './CookieChecker.vue'
import ATalkWithGod from './ATalkWithGod.vue'
import AlreadyConnected from './AlreadyConnected.vue'
import Metaverse from '../../Metaverse.vue'
import MetaOverlay from './MetaOverlay.vue'
import ProfilePage from './ProfilePage.vue'
import PongGame from './PongGame.vue'
import { backend, getRequestParams } from './connect_params.ts'
import Home from '../../Home.vue'
import Shop from './Shop.vue'
import Leaderboard from './Leaderboard.vue'
import { Socket, io } from "socket.io-client";
import {getRandomUsername, numberIsInRange} from './metaverse/utils';
import { useRouter } from 'vue-router';


export default defineComponent({
  name: 'GUI',
  components: {
    CookieChecker,
    ATalkWithGod,
    AlreadyConnected,
    Metaverse,
    MetaOverlay,
    ProfilePage,
    Home,
    Shop,
    Leaderboard,
    PongGame,
   },
  data () {
    return ({
      profile_state: 'no',
      register_token: '',
      in_store: false,
      in_metaverse: false,
      in_admin_page: false,
      log_token: '',
      auto_image: '',
      listening_to_god: false,
      access: {register_token: '',
                auto_image: ''},
      showing_profile_image: false,
      meta_colleague_id: '',
      already_connnected: false,
      in_match: false,
      room_id: 0,
      match_mode: 0,
    })
  },
  methods: {
    listen_to_god(access: any) {
      this.listening_to_god = true
      this.access = access
    },
    start_register () {
      this.listening_to_god = false
      this.register_token = this.access.register_token
      console.log(this.register_token)
      this.auto_image = this.access.auto_image
      this.profile_state = 'registering'
    },
    go_to_metaverse (logToken : string) {
      fetch (backend + '/log/me/' + logToken, getRequestParams()).then((a) => {
        a.json().then((player) => {
          globalThis.id = player.id
          globalThis.my_data = player
          globalThis.username = player.name
          globalThis.is_admin = player.isAdmin
          globalThis.logToken = logToken
          this.in_metaverse = true
          this.log_token = logToken
        })
      })
    },
    metaProfileHandler (profile) {
      this.meta_colleague_id = profile.name
      this.showing_profile_image = true
    },
    storeHandler () {
      this.in_store = true;
    },
    close_profile() {
      this.showing_profile_image = false
    },
    go_to_alredy_connected_page () {
      this.already_connected = true
    },
    go_to_pong_match (match_data) {
      console.log(match_data)
      this.close_inventory()
      this.room_id = match_data.match_id
      this.match_mode = match_data.mode
      this.in_match = true
    },
    closeShop() {
      this.in_store = false;
    }
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

</style>
