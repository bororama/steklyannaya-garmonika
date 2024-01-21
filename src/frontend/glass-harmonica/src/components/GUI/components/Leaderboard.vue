<template>
  <div class="global">
    <h1>Leaderboard</h1>
    <div v-for="(player, index) in leaderboard" :key="index">
      <div><h3>{{ player.name }}</h3></div>
      <div class="items">
        <div class="item-container">
          <img src="../../../../public/items/perla.png" class="mini">
            {{ player.pearls }}
          </div>
        <div class="item-container">
          <img src="../../../../public/items/collar.png" class="mini">
          {{ player.necklaces }}
        </div>
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
  width: 60%;
  margin: 1.4em;
  border: solid;
  border-width: 4px;
  border-color: var(--border_color);
  border-radius: 2px;
  margin: 1em;
}

.item-container {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
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
  margin: 10%;
}

.items{
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>