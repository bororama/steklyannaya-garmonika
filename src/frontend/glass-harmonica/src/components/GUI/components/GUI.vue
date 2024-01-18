<template>
    <CookieChecker @register="listen_to_god" @log_success="go_to_metaverse"/>
    <ATalkWithGod @god_finished_speaking="start_register" v-if="listening_to_god"/>
    <ProfilePage v-if="profile_state == 'registering'" :display_status="profile_state" :auto_image="auto_image" :register_token="register_token" />
    <div class="overlay" v-if="showing_profile_image">
        <ProfilePage display_status="profile_display" :userId="meta_colleague_id"/>
        <button class="fa_button" @click="close_profile">Close Profile</button>
    </div>
    <AlreadyConnected v-if="false"/>
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

export default defineComponent({
  name: 'GUI',
  components: {
    CookieChecker,
    ATalkWithGod,
    AlreadyConnected,
    Metaverse,
    MetaOverlay,
    ProfilePage
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
                auto_image: ''},
      showing_profile_image: false,
      meta_colleague_id: ''
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
      this.in_metaverse = true
      this.log_token = logToken
    },
    metaProfileHandler (profile) {
//      router.push('profile_page/' + profile.name)
      console.log("PRROOOFILE")
      this.meta_colleague_id = profile.name
      this.showing_profile_image = true
    },
    storeHandler () {
    },
    close_profile() {
      this.showing_profile_image = false
    }

  }
})
</script>

<style>


body {
  background-color: #392919d5
}
</style>
