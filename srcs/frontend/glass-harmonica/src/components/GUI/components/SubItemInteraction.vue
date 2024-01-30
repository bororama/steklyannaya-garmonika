<template>
	<div class="sub_interaction_wrapper" v-if="this.interaction != 'none'">
		<ViewMessagesPopup @close_interaction="close" :chatId="item.chat_id" :user="item.sender" v-if="this.interaction == 'viewing_messages'"/>
		<SendMessagePopup @close_interaction="close" :chat_id="item.chat_id" :sender="item.sender" v-if="this.interaction == 'sending_message'"/>
		<SetPasswordPopup @close_interaction="close" @set_password="set_password" v-if="this.interaction == 'setting_password'"/>
		<InputPasswordPopup @close_interaction="close" @unlock_password="unlock_password" v-if="this.interaction == 'unlocking_password'"/>
		<InputPasswordPopup @close_interaction="close" @unlock_password="unlock_padlock" v-if="this.interaction == 'unlocking_padlock'"/>
		<ViewMembersPopup @close_interaction="close" @user_interact="user_interact" :members="users_in_chat" v-if="this.interaction == 'displaying_members' || this.interaction == 'making_admin' || this.interaction == 'unmaking_admin' || this.interaction == 'kicking_member'"/>
        <AddMemberPopup v-if="this.interaction == 'adding_member'" :chat_id="item.chat_id" @close_interaction="close"/>
        <BanTimeUserPopup v-if="this.interaction == 'time_banning'" :chat_id="item.chat_id" @close_interaction="close"/>
        <div  v-if="displaying_profile" class="overlay">
            <button @click="closeProfile">Close Profile</button>
            <ProfilePage display_status="profile_display" :userId="display_userId" @start_match="(param) => $emit('go_to_pong_match', param)"/>
        </div>
        <div  v-if="this.interaction == 'user_display'" class="overlay">
            <button @click="stop_user_display">Close Profile</button>
            <ProfilePage  display_status="profile_display" :userId="userId" @start_match="(param) => $emit('go_to_pong_match', param)"/>
        </div>
	</div>
</template>

<script>
import SendMessagePopup from './SendMessagePopup.vue'
import ViewMessagesPopup from './ViewMessagesPopup.vue'
import SetPasswordPopup from './SetPasswordPopup.vue'
import InputPasswordPopup from './InputPasswordPopup.vue'
import ViewMembersPopup from './ViewMembersPopup.vue'
import ProfilePage from './ProfilePage.vue'
import AddMemberPopup from './AddMemberPopup.vue'
import BanTimeUserPopup from './BanTimeUserPopup.vue'

import {postRequestParams, getRequestParams} from './connect_params.ts' 

export default {
	name: 'SubItemInteraction',
	props: ['interaction', 'item', 'userId'],
	components: {
		SendMessagePopup,
		ViewMessagesPopup,
		InputPasswordPopup,
		SetPasswordPopup,
		ViewMembersPopup,
        ProfilePage,
        AddMemberPopup,
        BanTimeUserPopup
	},
	methods: {
		close () {
			this.$emit('close_interaction');
		},
		set_password(password) {
			this.$emit('set_password', password);
			this.close();
		},
		unlock_password(password) {
			this.$emit('unlock_password', password)
		},
		unlock_padlock(password) {
			this.$emit('unlock_padlock', password)
		},
		user_interact(member) {
			if (this.interaction == 'making_admin')
			{
				if (!this.check_is_admin(member))
					this.$emit('make_admin', member)
			} else if (this.interaction == 'unmaking_admin') {
					this.$emit('unmake_admin', member)
			} else if (this.interaction == 'kicking_member') {
				if (member != this.item.sender)
				{
					if (member.isAdmin)
					{
						if (member.isOwner)
							this.$emit('kick_member', member)
					}
					else
						this.$emit('kick_member', member)
				}
			} else if (this.interaction == 'displaying_members') {
              this.display_userId = member
              this.displaying_profile = true
            }
		},
		check_is_admin(member) {
			if (member.isOwner)
				return false;
            return (member.isAdmin)
		},
        getUsersInChat(id) {
          if (this.item.item_type == "rosary")
          {
            fetch(globalThis.backend+ "/chats/"+ id +"/users", getRequestParams()).then((response) => {
                response.json().then( (r) => {
                  this.users_in_chat = r;
                });
            });
          }
        },
        closeProfile() {
          this.displaying_profile = false
        },
        stop_user_display() {
          this.$emit('stop_user_display')
        }
	},
    data () {
      return ({
        users_in_chat: [],
        displaying_profile: false,
        display_userId: ""
      })
    },
    mounted() {
      this.getUsersInChat(this.item.chat_id);
    }
}
</script>

<style>
</style>
