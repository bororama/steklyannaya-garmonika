<template>
    <div id="talk_to_god_centerer">
        <Transition>
            <h1 v-if="text_enabled" id="god_voice">{{this.current_text}}</h1>    
        </Transition>
    </div>
</template>

<script lang="es">
import { defineComponent } from 'vue'
import * as god_talk from '../god_talk.json'

export default defineComponent({
  name: 'ATalkWithGod',
  data () {
    return ({
      current_text: '',
      text_enabled: true
    })
  },
  created() {
    this.letGodSpeak()
    console.log("LETTING SPEAK")
  },
  methods: {
    async letGodSpeak() {
      for (const t in god_talk.god_knowledge) {
        const text = god_talk.god_knowledge[t]
        this.current_text = text
        await new Promise(f => setTimeout(f, 5000))
      }
      this.text_enabled = false;
      console.log("EMIT")
      this.$emit('god_finished_speaking')
    }
  }
})

</script>

<style>


#god_voice {
    position: relative;
    top:45%;
    animation: god_speaks;
    opacity:0;
    animation-duration: 5s;
    animation-iteration-count: infinite;
}
#talk_to_god_centerer {
    width: 98vw;
    height: 98vh;
}

@keyframes god_speaks {
  0% {opacity: 0}
  25% {opacity: 100%}
  50% {opacity: 100%}
  100% {opacity: 0}
}

</style>
