<template>
    <div id="meta_overlay">
      <div class="interface_buttons">
      <ButtonedInventory @inventory_open="open_inventory" @inventory_close="close_inventory"/>
      <button class="fa_button see_profile_button" v-if='profile_state === "no"' @click="open_profile">See Profile</button>
      <button v-if='profile_state != "no"' @click="close_profile" class="fa_button">Close Profile</button>
      <button class="fa_button float_right" v-if="!in_admin_page && is_admin" @click="open_admin_page">AdminPage</button>
      <button v-if='in_admin_page' @click="close_admin_page" class="fa_button">Close Admin</button>
      </div>
      <div class="overlay" v-if="profile_state != 'no'">
        <ProfilePage display_status="personal_profile"/>
      </div>
      <div class="overlay" v-if="opened_inventory">
        <InventoryPopupable/>
      </div>
      <AdminPage v-if="in_admin_page"/>
    </div>
</template>


<script lang="ts">

import ProfilePage from './ProfilePage.vue'
import AdminPage from './AdminPage.vue'
import ButtonedInventory from './ButtonedInventory.vue'
import InventoryPopupable from './InventoryPopupable.vue'

import { defineComponent } from 'vue'

export default defineComponent({
    name: 'MetaOverlay',
    components: {
      ProfilePage,
      AdminPage,
      ButtonedInventory,
      InventoryPopupable
    },
    data() {
      return ({
        profile_state: 'no',
        in_admin_page: false,
        auto_image: '',
        opened_inventory: false,
        is_admin: globalThis.is_admin
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
    }
})

</script>

<style>

#meta_overlay {
    position: absolute;
    z-index: 10;
    left: 0;
    top:0;
}

.interface_buttons {
    position:absolute;
    display: flex;
    z-index: 10;
    left: 13vw;
    top: 87vh;
}

</style>
