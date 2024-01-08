<style>
</style>

<template>
    <h1 style="color: red">404</h1>
    <p>{{ haiku }}</p>
</template>

<script setup>
import { ref } from 'vue';
import { onMounted } from "@vue/runtime-core";

const haiku = ref('');

onMounted( async () => {
    const response = await fetch (`http://${import.meta.env.VITE_HOST_IP}:3000/meta/haiku`, {
        method : "GET",
    });
    haiku.value = await response.text();
    console.log("haiku value ", haiku.value);
});


</script>