<template>
	<div class="overlay">
		<div class="send_popup_background bordered_popup">
			<h3>Sending a  message to <b>{{ this.target }}</b></h3>
			<div class="text_wrapper">
				<textarea class="text_input" v-model="message_text_component"></textarea>
			</div>
			<button class="send_message" @click="send_message()">Send</button>
		</div>
	</div>
</template>

<script>
export default {
	props: ['target', 'sender'],
	data: () => ({
		message_text_component: ""
	}),
	methods:{
		send_message() {
			try {
				fetch ("http://localhost:4242/send_message?" + new URLSearchParams({
					sender: this.sender,
					target: this.target,
					text: this.message_text_component
				}));
			} catch (e) {
				console.log(e);
			}
			this.$emit('close_interaction');
		}
	}
}

</script>

<style>
.overlay {
	width: 100vw;
	height: 100vh;
	position:absolute;
	background-color: #bbbbbbdd;
	top: 0;
	left:0;
}

.send_popup_background {
	width: 45vw;
	height: 15vh;
	min-width: 300px;
	min-height: 200px;
	background-color: #497ae5;
	margin: 25%;
}

.text_input {
	max-width: 40vw;
	max-height: 5vw;
}

.send_message {
	margin: 2%;
	border-style: solid;
	border-color: #efcd23; 
	border-radius: 3px;
	width: 40%;
	height: 20%;
	font-size: 15px;
	font-family: monospace;
	cursor: pointer;
}

.text_wrapper {
	width: 100%;
}

.h3 {
	font-family: monospace;
}

</style>
