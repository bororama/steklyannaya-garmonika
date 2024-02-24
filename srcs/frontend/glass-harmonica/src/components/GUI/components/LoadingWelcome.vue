<template>
<p class="secure_text" >{{secure_text}}</p>
</template>

<script setup>

import { onMounted, ref } from 'vue'

const secure_text = ref('')

import secure from '../secure_text.json'

onMounted(() => {
  move_text()
})

async function move_text() {
  for (const t in secure.secure) {
    const text = secure.secure[t]
    secure_text.value = text
    await new Promise(f => setTimeout(f, Math.random() * 800 + 200))
  }
  this.text_enabled = false;
  this.$emit('god_finished_speaking')
}

</script>

<style>
.secure_text {
  font-family: joystix
}
</style>
