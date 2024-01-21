<template>
<div class="item_drop_wrapper">
	<div class="item-border">
        <img class="fondo_objeto" :src="fondo_objeto">
		<div :class="{'item-glow': true, 'match-glow': this.item.glow == 'match', 'notif-glow': this.item.glow == 'notif'}" v-if="item.glow != 'none'"></div>
		<img class="item_image" :src="item_path" @click="show_drop()" @mouseenter="relay_description">
	</div>
	<div v-if="drop_enabled" class="dropdown_wrapper">
		<ul class="dropdown_list">
			<li v-for="(option, index) in item.owner_options" :key="index" class="dropdown_option" @click="act(option.action)">{{ option.text }}</li>
			<li v-for="(option, index) in item.admin_options" :key="index" class="dropdown_option" @click="act(option.action)">{{ option.text }}</li>
			<li v-for="(option, index) in item.options" :key="index" class="dropdown_option" @click="act(option.action)">{{ option.text }}</li>
		</ul>
	</div>
	<SubItemInteraction @close_interaction="close_sub_item_interaction" @set_password="set_password" @unlock_password="unlock_password" @make_admin="make_admin" @unmake_admin="unmake_admin" @kick_member="kick_member" @stop_user_display="stop_displaying_user" @go_to_pong_match="(param) => {$emit('go_to_pong_match', param)}" :interaction="this.active_interaction" :item="this.item" :userId="userId"/>
</div>

</template>


<script>

import break_pearl from '../break_pearl.js'
import repair_pearl from '../repair_pearl.js'
import generate_padlock from '../generate_padlock.js'
import SubItemInteraction from './SubItemInteraction.vue'
import break_rosary from '../break_rosary.js'
import repair_rosary from '../repair_rosary.js'
import {backend, getRequestParams, postRequestParams, deleteRequestParams} from './connect_params'
import fondo from '../assets/fondo_objeto.png'

export default {
	name: 'InventoryItem',
	props: ['item_data'],
	data() {
		return ({
			item:this.item_data,
			drop_enabled:false,
			active_interaction: "none",
            password: "",
            userId: "",
			fondo_objeto: fondo,
			item_path: ''
		});
	},
	created () {
		this.item_path = '/public/items/' + this.item.image
	},
	methods: {
		show_drop () {
			this.drop_enabled = true
		},
		close_drop () {
			this.drop_enabled = false
		},
		relay_description() {
			this.$emit('change_active_description', this.item.description)
		},
		act (action) {
			if (action == "send_message") {
				this.active_interaction = "sending_message";
				this.close_drop();
			} else if (action == "view_messages") {
				this.active_interaction = "viewing_messages";
				this.close_drop();
			} else if (action == "close_drop") {
				this.close_drop()
			} else if (action == "ban") {
				if (this.item.item_type == "pearl")
                {
                    fetch(backend + '/' + globalThis.id + '/blocks/' + this.item.target, postRequestParams);
					this.item = break_pearl(this.item);
                }
				else
					this.item = break_rosary(this.item);
				this.close_drop();
			} else if (action == "unban") {
				if (this.item.item_type == "broken_pearl")
                {
                    fetch(backend + '/' + globalThis.id + '/blocks/' + this.item.target, deleteRequestParams);
					this.item = repair_pearl(this.item);
                }
				else
					this.item = repair_rosary(this.item);
				this.close_drop();
			} else if (action == "add_password") {
				this.active_interaction='setting_password'
				this.close_drop();
			} else if (action == "enter_password") {
				this.active_interaction='unlocking_password'
				this.close_drop();
			} else if (action == "display_members") {
				this.active_interaction='displaying_members'
				this.close_drop();
			} else if (action == "make_admin") {
				this.active_interaction="making_admin"	
				this.close_drop();
			} else if (action == "unmake_admin") {
				this.active_interaction="unmaking_admin"	
				this.close_drop();
			} else if (action == "kick_member") {
				this.active_interaction = "kicking_member"
				this.close_drop();
            } else if (action == "display_sender") {
              this.userId = this.item.sender;
              this.active_interaction = "user_display";
              this.close_drop();
            } else if (action == "display_target") {
              this.userId = this.item.target;
              this.active_interaction = "user_display";
              this.close_drop();
            } else if (action == "accept_friendship") {
              fetch(backend + '/players/' + globalThis.id + '/acceptFrienshipRequest/' + this.item.sender, postRequestParams);
              this.close_drop();
              this.item = generate_pearl(this.item.sender, this.item.target);
            } else if (action == "reject_friendship") {
              fetch(backend + '/players/' + globalThis.id + '/declineFrienshipRequest/' + this.item.sender, postRequestParams);
              this.close_drop();
            } else if (action == "go_to_pong_match") {
              this.$emit('go_to_pong_match', {match_id: this.item.match_id, mode: 0})
              this.close_drop();
            } else if (action == "add_member") {
              this.active_interaction = "adding_member";
              this.close_drop();
			} else {
				console.log("ERROR: Unrecognised option");
			}
		},
		close_sub_item_interaction() {
			this.active_interaction = 'none';
		},
		set_password(password) {
            fetch(backend+ "/chats/"+ this.item.chat_id + "/setPassword", {
                method: 'POST',
                mode: 'cors',
                headers: {
                  "Content-Type": "application/json",
                  'Accept': 'application/json'
                },
                body: JSON.stringify({password})
            }).then((r) => {
              console.log(r);
             });
			this.item = generate_padlock(this.item, password);
		},
		unlock_password(password) {
            try {
              fetch(backend + "/chats/"+ this.item.locked_item.chat_id + "/users", {
                  method: 'POST',
                  mode: 'cors',
                  headers: {
                    "Content-Type": "application/json",
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify({password})
                }).then((r) => {
                    if (r.status == 201)
                    {
                        this.item = this.item.locked_item;
                        this.active_interaction = 'none';
                    }
                });
            } catch (e) {
              console.log(e);
            }
		},
		make_admin(member) {
            fetch(backend + "/chats/" + this.item.rhat_id + "/admins/" + member, postRequestParams); 
			this.active_interaction = 'none';
		},
		unmake_admin(member) {
			//TODO inform server of change
			for (var i in this.item.admins) {
				var a = this.item.admins[i];
				if (a == member)
					this.item.admins.splice(i, 1);
			}
			this.active_interaction = 'none';
		},
		kick_member(member) {
            fetch(backend + "/chats/" + member + "/" + this.item.chat_id, deleteRequestParams); 
			for (var i in this.item.target) {
				if (this.item.target[i] == member)
					this.item.target.splice(i, 1);
			}
			for (var j in this.item.admins) {
				if (this.item.admins[j] == member)
					this.item.admins.splice(j, 1);
			}
			this.active_interaction = 'none';
		},
        stop_displaying_user() {
          this.active_interaction = 'none'
        }
     },
	components: {
		SubItemInteraction
	}
}

</script>

<style>
.item_image {
	width: 100px;
	height: 100px;
	padding: 3px;
	margin-top: 3px;
    margin: 20px;
}

.item_image:hover {
	border: solid;
	border-color: #497ae5;
	border-width:3px;
	padding: 0px;
}

.item-border {
/*	border: solid;
	border-width: 3px;
	border-color: #f7e06c;
*/}

.item-glow {
	border-radius:50%;
	position:absolute;
	width: 20px;
	height:20px;
	margin: 50px;
	animation-duration: 0.75s;
	animation-direction: alternate;
	animation-iteration-count: infinite;
	animation-timing-function: ease-in;
	z-index: -1;
}

.notif-glow {
	animation-name: glow_animation;
}

.match-glow {
  animation-name: glow_animation_match;
}

.fondo_objeto {
	position:absolute;
	width: 143px;
	height: 143px;
	z-index: -1;
}

@keyframes glow_animation {
	from {box-shadow: 0 0 40px 40px #497ae5;}
	to {box-shadow: 0}
}

@keyframes glow_animation_match {
	from {box-shadow: 0 0 40px 40px #c93012;}
	to {box-shadow: 0}
}


.item_drop_wrapper {
	width: 143px;
	height: 143px;
}

.dropdown_wrapper {
	background-color: #392919;
	text-align:center;
	border-radius:3px;
	border-style: solid;
	border-color: #603f22;
    border-width: 5px;
	position:relative;
	width: 20vw;
	left: -20%;
	top: -50%;
}

.dropdown_option {
	text-align:center;
	cursor: pointer;
	color: #ffffff;
	font-family: joystix;
    font-size: 70%;
	padding: 0;
	margin: 0.5vw 0.8vw;
}

.dropdown_option:hover {
	text-align:center;
	cursor: pointer;
	background-color: #85d8e5d0;
	color: #ffffff;
}

.dropdown_list {
	list-style-type: none;
	padding: 0;
	margin: 0;
	text-align:center;
}

</style>
