<template>

<div class ="history_container">
    <OneStat v-for="(entry, index) in this.history" :key="index" :title="entry.rivals[0] + ' - ' + entry.rivals[1]" :value="entry.result[0] + ' - ' + entry.result[1]"/>
</div>

</template>

<script lang="ts">

import { defineComponent } from 'vue'
import OneStat from './OneStat.vue'
import { backend, getRequestParams } from './connect_params'

export default defineComponent({
  name: 'MatchHistory',
  props: ['userId'],
  components: {
    OneStat
  },
  methods: {
    setHistory () {
      fetch(backend + '/matches/' + this.userId, getRequestParams).then((matches) => {
        matches.json().then((m) => {
          for (const match in m) {
            if (m[match].endDate != null) {
              this.history.push({rivals: [m[match].player1.name, m[match].player2.name], result: ['0', '0']})
            }
          }
        })
      })
      return (history)
    }
  },
  data () {
    return ({
      history: [{rivals: ['',''], result:['0', '0']}]
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
  margin: 0 1em;
}
</style>
