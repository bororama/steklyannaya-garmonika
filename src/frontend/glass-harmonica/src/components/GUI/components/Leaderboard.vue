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
            <img src="../../../../public/items/collar.png" class="mini">
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
              {{ player.necklaces }}
            </div>
          </td>
        </tr>
      </table>
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
<<<<<<< HEAD
  width: 2vw;
  margin: 1.4em;
  border: solid;
  border-width: 4px;
  border-color: var(--border_color);
  border-radius: 2px;
  margin: 1em;
=======
  width: 100px;
}

.t-column {
  width: 33%;
  background-color:#2f855b9e;
>>>>>>> origin/main
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
<<<<<<< HEAD
}
div {

=======
  font-family: 'joystix';
>>>>>>> origin/main
}

.items{
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>