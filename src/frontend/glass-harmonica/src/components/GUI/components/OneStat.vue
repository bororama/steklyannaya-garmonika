<template>
<h3>{{this.title}}</h3>
<p>{{this.value}}</p>

</template>

<script lang="ts">

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'OneStat',
  props: ['title', 'value']

})

</script>

<style>

</style>
