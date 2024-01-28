<template>
    <div style="width:100%;height:100%;background-color:pink">
        <h1>{{userId}}'S PROFILE PAGE</h1>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const userId = route.params.userId;
</script>