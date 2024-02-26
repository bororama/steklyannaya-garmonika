<template>
<div class="overlay">
<InventoryGrid  @change_active_description="change_active_description" @go_to_pong_match="(param) => {console.log('GRID'); console.log(param); $emit('go_to_pong_match', param)}"/>
<SendMessagePopup :target="message_login" :sender="message_sender" v-if="message_popup" @close="disable_message_popup"/>
<ViewMessagesPopup :target="message_login" :messages="view_messages" v-if="view_messages_popup" @close="disable_view_messages_popup"/>
<InformationPopup class="info_popup" :info_text="this.active_description"/>
<router-view></router-view>
</div>
</template>

<script>
import InventoryGrid from './InventoryGrid.vue'
import SendMessagePopup from './SendMessagePopup.vue'
import ViewMessagesPopup from './ViewMessagesPopup.vue'
import InformationPopup from './InformationPopup.vue'

export default {
  name: 'InventoryPopupable',
  components: {
	ViewMessagesPopup,
	InventoryGrid,
	SendMessagePopup,
	InformationPopup
  },
  data () {
	return {
		message_popup: false,
		view_messages_popup: false,
		message_login: "crisfern",
		view_messages: [],
		active_description: ""
	}
  },
  methods: {
		activate_message_popup(login, sender) {
			this.message_login = login;
			this.message_sender = sender;
			this.message_popup = true;
		},
		disable_message_popup() {
			this.message_popup = false;
		},
		change_active_description(new_description) {
			this.active_description = new_description;
		},
	}
}
</script>

<style>
.info_popup {
	margin: 10% 0 0%0;
}
</style>
