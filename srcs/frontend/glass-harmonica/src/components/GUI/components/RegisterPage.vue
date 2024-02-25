<template>
    <ATalkWithGod v-if="!god_finished" @god_finished_speaking="enable_register"/>
    <ProfilePage v-if="god_finished" display_status="registering"  @successful_register="go_to_metaverse" :register_token="register_token" :auto_image="auto_image"/>
</template>

<script setup>
import ProfilePage from './ProfilePage.vue'
import ATalkWithGod from './ATalkWithGod.vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

let god_finished = ref(false)
let route = useRoute()
let router = useRouter()
let auto_image = ref('')
let register_token = ref('')

function enable_register () {
  god_finished.value = true
}

function go_to_metaverse() {
  router.push('/')
}

onMounted(() => {
    auto_image = route.query.auto_image
    register_token = route.query.register_token
    if (auto_image == null || register_token == null)
    {
      router.push('/bad_request')
    }
    window.history.replaceState({}, document.title, "/#/register")

})

</script>
