<template>
    <button :class="{fa_button:true, float_right:true, selected_fa:opened}" @click="toggle">{{active_text}}</button>
</template>

<script setup>

import { defineProps, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps(['open_text', 'closed_text', 'router_path'])
const active_text = ref()
const router = useRouter()
const opened = ref(false)

onMounted(() => {
  active_text.value = props.closed_text
  router.beforeEach((to, from, next) => {
    if (to.path == props.router_path) {
      active_text.value = props.open_text
      opened.value = true
    } else if (to.path != props.router_path) {
      active_text.value = props.closed_text
      opened.value = false
    }
    next()
  })
})

function toggle() {
  if (opened.value) {
    opened.value = false
    active_text.value = props.closed_text
    router.push("/")
  } else {
    opened.value = true
    active_text.value = props.open_text
    router.push(props.router_path)
  }
}

</script>

<style>

.selected_fa {
  background: var(--select_light)
}
</style>
