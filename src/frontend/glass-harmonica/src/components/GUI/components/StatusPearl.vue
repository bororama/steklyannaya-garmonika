<template>
    <img :class="{status_pearl: true, in_match_status: this.online_status == 'in_match', online_status: this.online_status == 'online'}" :src="image">
</template>

<script>
import { defineComponent } from 'vue'
import pearl from '../assets/perla.png'
import {backend, getRequestParams} from './connect_params'

export default defineComponent({
  name: 'StatusPearl',
  props: ['username'],
  data () {
    return ({
      image: pearl,
      online_status: 'disconnected'
    })
  },
  methods: {
    getStatus () {
      fetch(backend + '/players/' + this.username, getRequestParams()).then((a) => {
        a.json().then((answer) => {
          if (answer.status == 'online')
            this.online_status = 'online'
          else if (answer.status == 'inMatch')
            this.online_status = 'in_match'
          else
            this.online_status = 'disconnected'
          this.$emit('user_status_update', this.online_status)
        })
      })
    }
  },
  created () {
    this.getStatus()
  }
})
</script>

<style>

.status_pearl {
  width: 2em;
  height: 2em;
}

.online_status {
  filter: hue-rotate(90deg) contrast(110%) drop-shadow(0 0 0.35em green);
}

.in_match_status {
  filter: hue-rotate(290deg) contrast(110%) drop-shadow(0 0 0.35em crimson);
}

</style>
