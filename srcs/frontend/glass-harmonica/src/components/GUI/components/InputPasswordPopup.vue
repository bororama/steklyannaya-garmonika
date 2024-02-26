<template>
	<div class="overlay">
		<div class="set_number_popup_background">
			<h3>Enter password (alphanumeric and shorter tha 20)</h3>
			<div class="text_wrapper">
				<textarea class="password_input" v-model="password_component"></textarea>
			</div>
			<button class="send_message" @click="unlock()">Unlock</button>
		</div>
	</div>
</template>

<script>

import { postRequestParams } from './connect_params.ts'
export default {
	props: ['chat_id'],
	data: () => ({
		password_component: ""
	}),
	methods:{
		unlock() {
	      this.$emit('unlock_password', this.password_component);
		}
	}
}

</script>

<style>

.send_number_popup_background {
	width: 15vw;
	min-width: 80px;
}

.password_input {
	width: 10vw;
}

</style>
