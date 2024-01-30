<style>
:root {
  --border_color: #603f22;
  --pop_background: #392919;
  --select_light: #85d8e5d0;
}

@font-face {
  font-family: 'joystix';
  src: url('/fonts/joystix_monospace.otf') format('opentype');
}

#app {
  text-align: center;
  color: white;
}

</style>

<template>
  	<router-view></router-view>
</template>

<script setup lang="ts">

import NotFound from './components/NotFound.vue';
import PongInstructions from './components/GUI/components/PongInstructions.vue';
import Home from './components/ProfilePage.vue';
import { useRouter } from 'vue-router';


//const router = useRouter();
console.log("http://" + process.env.HOST + ":3000");


</script>

