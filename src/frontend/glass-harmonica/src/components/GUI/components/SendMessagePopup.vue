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

import { backend, postRequestParams } from './connect_params'
export default {
	props: ['chat_id', 'sender'],
	data: () => ({
		message_text_component: ""
	}),
	methods:{
		send_message() {
            let param = postRequestParams

            param.body = JSON.stringify({
              "message": this.message_text_component
            })
            fetch (backend + '/chats/' + this.chat_id + '/sendMessage/' + this.sender, param)
			this.$emit('close_interaction');
		}
	}
}

</script>

<style>
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
