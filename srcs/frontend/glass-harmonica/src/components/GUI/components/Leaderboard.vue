<template>
  <div class="global overlay-3">
    <h1 style="font-family: joystix; font-size: 48px; text-shadow: #FC0 1px 0 10px;">Leaderboard</h1>
    <div style="max-height: 500px;overflow-y: scroll;width:100%;max-width: 750px;"> 
      <table style="margin: 0 auto;width: 100%;max-width: 750px;">
        <tr>
          <td class="t-column" style="font-size:32px">
            Name
          </td>
          <td class="t-column">
            <img src="../../../../public/items/perla.png" class="mini">
          </td>
          <td class="t-column">
            <img src="../../../../public/items/franciscoin.png" class="mini">
          </td>
        </tr>
        <tr v-for="(player, index) in leaderboard" :key="index">
          <td class="t-column">
            <div><h3>{{ player.name }}</h3></div>
          </td>
          <td class="t-column">
            <div class="item-container">
                {{ player.pearls }}
              </div>
          </td>
          <td class="t-column">
            <div class="item-container">
              {{ player.franciscoins }}
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>

import { getRequestParams } from './connect_params'

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
      fetch(globalThis.backend + '/players/leaderboard', getRequestParams()).then((answer) => {
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
  width: 100px;
}

.t-column {
  width: 33%;
  background-color:#2f855b9e;
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
  width: 100vw;
  margin: 0 auto;
  font-family: 'joystix';
}

.items{
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
