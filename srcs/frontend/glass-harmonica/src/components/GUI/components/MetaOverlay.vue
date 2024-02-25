<template>
  <div id="meta_overlay">
    <div class="interface_buttons">
      <ButtonedInventory @inventory_open="open_inventory" @inventory_close="close_inventory" />
      <TogglableRouteButton v-if="is_admin" open_text="Close Admin" closed_text="Adminpage" router_path="/admin_page"/>
      <TogglableRouteButton open_text="Close Profile" closed_text="See Profile" router_path="/profile_page"/>
      <TogglableRouteButton open_text="Close Ranking" closed_text="Ranking" router_path="/leaderboard"/>
      <TogglableRouteButton open_text="Close Inst" closed_text="Instructions" router_path="/help"/>
    </div>
  </div>
</template>


<script lang="ts">

import ButtonedInventory from './ButtonedInventory.vue'
import TogglableRouteButton from './TogglableRouteButton.vue'

import { defineComponent } from 'vue'

export default defineComponent({
    name: 'MetaOverlay',
    data() {
      return ({
        is_admin: globalThis.is_admin
      })
    },
    components: {
      ButtonedInventory,
      TogglableRouteButton
    },
    created() {
      this.$router.beforeEach((to, from, next) => {
        next()
      })
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
  position: fixed;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  z-index: 10;
  left: 6vw;
  top: 84%;
}
</style>
