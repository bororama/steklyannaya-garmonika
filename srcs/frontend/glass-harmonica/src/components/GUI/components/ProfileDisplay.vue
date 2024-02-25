<template>
    <div class="overlay">
        <ProfilePage v-if="loaded" display_status="profile_display" :userId="userId"/>
    </div>
</template>

<script setup>
import ProfilePage from './ProfilePage.vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

let route = useRoute()
let userId = ref('')
let loaded =ref(false)

onMounted(() =>{
    userId.value = route.query.id    
    loaded.value = true
})

</script>
