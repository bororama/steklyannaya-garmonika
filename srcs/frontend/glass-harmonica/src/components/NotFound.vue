<style>
</style>

<template>
    <div style="z-index: 20; position: relative;">
        <h1 style="color: red; font-family: joystix;">404</h1>
        <p style="font-family: joystix;">{{ haiku }}</p>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { onMounted } from "@vue/runtime-core";

const haiku = ref('');

onMounted( async () => {
    const response = await fetch (`http://${process.env.HOST}:3000/meta/haiku`, {
        method : "GET",
    });
    haiku.value = await response.text();
    console.log("haiku value ", haiku.value);
});


</script>