<template>
	<div class="overlay">
		<div class="set_number_popup_background">
			<h3>Setting password</h3>
			<div class="text_wrapper">
				<textarea class="password_input" v-model="password_component"></textarea>
			</div>
			<button class="send_message" @click="lock()">Lock</button>
		</div>
	</div>
</template>

<script>
export default {
	props: ['target', 'sender'],
	data: () => ({
		password_component: ""
	}),
	methods:{
		lock() {
          if (this.password_component != "")
			this.$emit('set_password', this.password_component);
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
