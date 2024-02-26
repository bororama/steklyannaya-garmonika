<template>

	<div class="overlay">
		<div class="messages_holder">
			<div class="message_wrapper">
				<div v-for="(message, index) in this.messages" :key="index" class="one_message_container" :style="'animation-delay: ' + index * 0.15 + 's'">
					<li class="message">{{message}}</li>
				</div>
			</div>
			<button class="close_popup" @click="this.$emit('close_interaction')">Close</button>

		</div>
	</div>
</template>

<script>

import { getRequestParams } from './connect_params'
export default {
	name: "ViewMessagesPopup",
	props: ['chatId', 'user'],
    data () {
      return ({
        messages: []
      })
    },
    created () {
      this.getMessages()
    },
	methods: {

		beforeEnter: function (el) {
			el.style.opacity = 0;
		},
		enter: function (el) {
			el.style.opacity = '100%';
		},
		getMessages() {
          console.log(this.chatId, this.user)
          fetch (globalThis.backend + '/chats/' +  this.chatId + '/getMessages/' + this.user, getRequestParams()).then((a) => {
            a.json().then((messages) => {
               for (const m in messages) {
                 this.messages.push(messages[m].message)
               }
            })
          }) 
		}
	}
}

</script>

<style>

.one_message_container {
	background-image: linear-gradient(135deg, #f9de63 15%, #eab538 40%);
	margin: 0.6em 0;
	min-height: 1.5em;
	padding: 0.2em;
	animation-name: enter_message;
	animation-duration: 0.2s;
	animation-fill-mode: forwards;
	transform: translate(100%, 0);
}

@keyframes enter_message{
	from {
		transform: translate(100%, 0);
	}
	to {
		transform: translate(0, 0);
	}
}

.messages_holder {
	position:absolute;
	width: 40%;
	float: right;
	right:0;
}

.message_wrapper {
	padding: 0;
	font-family: monospace;
	max-height: 600px;
	overflow-y: auto;
	max-width: 750px;
}

.message {
	padding: 0.5% 3%;
	margin: 0;
	list-style-type:none;
	font-family: joystix;
}

</style>
