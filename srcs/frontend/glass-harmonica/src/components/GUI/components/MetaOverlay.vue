<template>
  <div id="meta_overlay">
    <div class="interface_buttons">
      <ButtonedInventory @inventory_open="open_inventory" @inventory_close="close_inventory" />
      <button class="fa_button see_profile_button" v-if='profile_state === "no"' @click="open_profile">See Profile</button>
      <button v-if='profile_state != "no"' @click="close_profile" class="fa_button">Close Profile</button>
      <button class="fa_button float_right" v-if="!in_admin_page && is_admin" @click="open_admin_page">AdminPage</button>
      <button v-if='in_admin_page' @click="close_admin_page" class="fa_button">Close Admin</button>
      <button class="fa_button float_right" v-if="!inLeaderBoard" @click="openLeaderBoard">Ranking</button>
      <button v-if='inLeaderBoard' @click="closeLeaderBoard" class="fa_button">Close Ranking</button>
      <router-link  to="/help">
        <button  class="fa_button">Instructions</button>
      </router-link>
    </div>
      <div class="overlay" v-if="profile_state != 'no'">
        <ProfilePage display_status="my_profile"/>
      </div>
      <div class="overlay" v-if="opened_inventory">
        <InventoryPopupable @go_to_pong_match="go_to_pong_match" @close_inventory="close_inventory"/>
      </div>
      <AdminPage v-if="in_admin_page"/>
      <PongGame v-if="in_match" :modo="match_mode" :pong-room-id="room_id" @match_finish="close_match" @closeGame="close_game"/>
    <Leaderboard v-if="inLeaderBoard" />
  </div>
</template>


<script lang="ts">

import ProfilePage from './ProfilePage.vue'
import AdminPage from './AdminPage.vue'
import ButtonedInventory from './ButtonedInventory.vue'
import InventoryPopupable from './InventoryPopupable.vue'
import PongGame from './PongGame.vue'
import Leaderboard from './Leaderboard.vue'
import PongInstructions from './PongInstructions.vue'

import { defineComponent } from 'vue'

export default defineComponent({
    name: 'MetaOverlay',
    components: {
      ProfilePage,
      AdminPage,
      ButtonedInventory,
      InventoryPopupable,
      PongGame,
      Leaderboard,
      PongInstructions
    },
    data() {
      return ({
        profile_state: 'no',
        in_admin_page: false,
        auto_image: '',
        opened_inventory: false,
        is_admin: globalThis.is_admin,
        in_match: false,
        room_id: '',
        match_mode: 0,
        inLeaderBoard: false,
        inPongInstructions: false
      })
    },
    methods: {
      open_damin_page () {
        this.in_admin_page = true
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
        this.opened_inventory = true
      },
      close_inventory () {
        this.opened_inventory = false
      },
      open_admin_page () {
        this.in_metaverse = false
        this.in_admin_page = true
      },
      close_admin_page () {
        this.in_admin_page = false
        this.in_metaverse = true
      },
      go_to_pong_match (match_data) {
        this.close_inventory()
        this.room_id = match_data.match_id
        if (match_data.boundless)
          this.match_mode = 1
        else
          this.match_mode = 0
        this.in_match = true
      },
      close_match () {
        this.in_match = false
      },
      openLeaderBoard() {
        this.in_metaverse = false
        this.inLeaderBoard = true
      },
      closeLeaderBoard() {
        this.inLeaderBoard = false
        this.in_metaverse = true
      },
      openPongInstructions() {
        this.in_metaverse = false
        this.inPongInstructions = true
      },
      closePongInstructions() {
        this.inPongInstructions = false
        this.in_metaverse = true
      },
      close_game() {
        this.in_match = false
      },
    }
})

</script>

<style>
#meta_overlay {
  position: absolute;
  z-index: 10;
  left: 0;
  top: 0;
}

.interface_buttons {
  position: absolute;
  display: flex;
  z-index: 10;
  left: 13vw;
  top: 87vh;
}
</style>
