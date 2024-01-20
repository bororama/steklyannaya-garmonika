<template>
  <div class="global">
    <h1>Leaderboard</h1>
    <div v-for="(player, index) in leaderboard" :key="index">
      <div>{{ player.name }}</div>
      <div class="coins-container">
        <img src="../../../../public/items/perla.png" class="mini">
        {{ player.pearls }}
      </div>
      <div class="coins-container">
        <img src="../../../../public/items/collar.png" class="mini">
        {{ player.necklaces }}
      </div>
      <hr>
    </div>
  </div>
</template>

<script>

import { backend, getRequestParams } from './connect_params'

export default {
  name: "Leaderboard",
  data() {
    return {
      leaderboard:[],
    };
  },
  mounted(){
    globalThis.id = 1; // QUITAR
    this.getLeaderboard();
  },
  methods: {
    getLeaderboard() {
      fetch(backend + '/players/leaderboard', getRequestParams).then((answer) => {
      answer.text().then((data) => {
        const obj = JSON.parse(data);
        this.leaderboard = obj;
        console.log(obj);
      })
    })
    },
  },
};

</script>

<style>

.mini {
  width: 15%;
  margin: 1.4em;
}

.coins-container {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5em;
}

.global {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  max-width: 20vh;
  margin: 0 auto;
}
div {

}

</style>