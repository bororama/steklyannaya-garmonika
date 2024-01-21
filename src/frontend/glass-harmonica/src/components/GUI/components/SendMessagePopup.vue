<template>
	<div class="overlay">
		<div class="send_popup_background bordered_popup">
			<h3 class="text">Sending a  message to <b>{{ this.target }}</b></h3>
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
<<<<<<< HEAD

=======
>>>>>>> origin/main
.send_popup_background {
	height:30vh;
	background-color: #392919;
	max-width: 1000px;
	min-width: 300px;
	margin: auto;
	border-radius: 0.2em;
	border-style: solid;
	border-color: #603f22;
    border-width: 1em;
}

.text_input {
	
	max-width: 40vw;
	max-height: 5vw;
}

.text{
	margin: 2%;

	font-family: joystix;

	text-shadow: 2px 2px black;
}
.send_message {
	margin: 2%;
	border-style: solid;
	border-color: #5a281f; 
	border-radius: 3px;
	width: 40%;
	height: 20%;
	font-size: 15px;
	cursor: pointer;
	font-family: joystix;
	color:black;
	margin: 0.8em 0 0.5em 0;
	text-shadow: 2px 2px black;
}

.text_wrapper {
	width: 100%;
}

.h3 {
	font-family: joystix;
}

</style>
