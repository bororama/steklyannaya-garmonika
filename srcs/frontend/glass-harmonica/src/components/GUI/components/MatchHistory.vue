<template>

<div class ="history_container">
    <OneStat v-for="(entry, index) in this.history" :key="index" :title="entry.rivals[0] + ' - ' + entry.rivals[1]" :value="entry.result[0] + ' - ' + entry.result[1]"/>
</div>

</template>

<script lang="ts">

import { defineComponent } from 'vue'
import OneStat from './OneStat.vue'
import { getRequestParams } from './connect_params'

export default defineComponent({
  name: 'MatchHistory',
  props: ['userId'],
  components: {
    OneStat
  },
  methods: {
    setHistory () {
      fetch(globalThis.backend + '/matches/' + this.userId, getRequestParams()).then((matches) => {
        matches.json().then((m) => {
          for (const match in m) {
            if (m[match].endDate != null) {
              if (m[match].player1 && m[match].player1.name && m[match].player2 && m[match].player2.name && m[match].pointsPlayer1 && m[match].pointsPlayer2) {
                  this.history.push({rivals: [m[match].player1.name, m[match].player2.name], result: [m[match].pointsPlayer1, m[match].pointsPlayer2]})
              }
            }
          }
          this.history.splice(0, 1);
        })
      })
      return (history)
    }
  },
  data () {
    return ({
      history: [{rivals: ['',''], result:['777', '444']}]
    })
  },
  created() {
    this.setHistory()
  }
})

</script>

<style>

.history_container {
  width: 100%;
  max-height: 400px;
  margin: 0 1em;
  overflow-y:scroll;
}
</style>
