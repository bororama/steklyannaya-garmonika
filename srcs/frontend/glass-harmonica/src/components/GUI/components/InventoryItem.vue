<template>
<div ref="clickOutsideExclude" class="item_drop_wrapper">
	<div class="item-border">
        <img class="fondo_objeto" :src="fondo">
		<div :class="{'item-glow': true, 'match-glow': item.glow == 'match', 'notif-glow': item.glow == 'notif'}" v-if="item.glow != 'none'"></div>
		<img class="item_image" :src="item_path" @click="show_drop()" @mouseenter="relay_description">
	</div>
	<div ref="clickOutsideComponent" v-if="drop_enabled" class="dropdown_wrapper">
		<ul class="dropdown_list">
			<li v-if="item.is_owner" v-for="(option, index) in item.owner_options" :key="index" class="dropdown_option" @click="act(option.action)">{{ option.text }}</li>
			<li v-if="item.is_admin" v-for="(option, index) in item.admin_options" :key="index" class="dropdown_option" @click="act(option.action)">{{ option.text }}</li>
			<li v-for="(option, index) in item.options" :key="index" class="dropdown_option" @click="act(option.action)">{{ option.text }}</li>
		</ul>
	</div>
	<SubItemInteraction @close_interaction="close_sub_item_interaction" @close_and_reload="close_and_reload" @set_password="set_password" @unlock_password="unlock_password" @make_admin="make_admin" @unmake_admin="unmake_admin" @kick_member="kick_member" @stop_user_display="stop_displaying_user" @unlock_padlock="unlock_padlock" :interaction="active_interaction" :item="item" :userId="userId"/>
</div>

</template>


<script setup>

import break_pearl from '../break_pearl.js'
import repair_pearl from '../repair_pearl.js'
import generate_padlock from '../generate_padlock.js'
import SubItemInteraction from './SubItemInteraction.vue'
import break_rosary from '../break_rosary.js'
import repair_rosary from '../repair_rosary.js'
import {getRequestParams, postRequestParams, deleteRequestParams} from './connect_params'
import fondo from '../assets/fondo_objeto.png'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClickOutside } from '../clickOutside.ts'
import { check_alpha_numeric } from '../form_validator.ts'

const props = defineProps(['item_data'])
const emit = defineEmits(['change_active_description', 'reload_inventory'])
const router = useRouter()

let item = ref(props.item_data)
let drop_enabled = ref(false)
let active_interaction = ref("none")
let password= ref("")
let userId = ref("")
let item_path = ref('')
const clickOutsideComponent = ref()
const clickOutsideExclude = ref()

useClickOutside(clickOutsideComponent, close_drop, clickOutsideExclude)

onMounted(() => {
  item_path.value = '/public/items/' + item.value.image
})

function show_drop () {
 	drop_enabled.value = true
}

function close_drop () {
 	drop_enabled.value = false
}

function relay_description() {
 	emit('change_active_description', item.value.description)
}

async function act (action) {
 	if (action == "send_message") {
 		active_interaction.value = "sending_message";
 		close_drop();
 	} else if (action == "view_messages") {
 		active_interaction.value = "viewing_messages";
 		close_drop();
 	} else if (action == "close_drop") {
 		close_drop()
 	} else if (action == "ban") {
 		if (item.value.item_type == "pearl")
           {
               await fetch(backend + '/' + globalThis.id + '/blocks/' + item.value.target, postRequestParams());
 			emit('reload_inventory');
           }
 		else
 			item = break_rosary(item.value);
 		    close_drop();
 	} else if (action == "unban") {
 		if (item.value.item_type == "broken_pearl")
           {
               await fetch(backend + '/' + globalThis.id + '/blocks/' + item.value.target, deleteRequestParams());
 			emit('reload_inventory');
           }
 		else
 			item.value = repair_rosary(item.value);
 		close_drop();
 	} else if (action == "add_password") {
 		active_interaction.value='setting_password'
 		close_drop();
       } else if (action == "remove_password") {
 		active_interaction.value='unlocking_password'
 		close_drop();
 	} else if (action == "enter_password") {
 		active_interaction.value='unlocking_padlock'
 		close_drop();
 	} else if (action == "display_members") {
 		active_interaction.value='displaying_members'
 		close_drop();
 	} else if (action == "make_admin") {
 		active_interaction.value="making_admin"	
 		close_drop();
 	} else if (action == "unmake_admin") {
 		active_interaction.value="unmaking_admin"	
 		close_drop();
 	} else if (action == "kick_member") {
 		active_interaction.value = "kicking_member"
 		close_drop();
       } else if (action == "display_sender") {
         userId.value = item.value.sender;
         active_interaction.value = "user_display";
         close_drop();
       } else if (action == "look_at_pearl") {
           router.push({path: '/inventory/pearl_close_up', query: {id: item.value.target}})
       } else if (action == "look_at_rose") {
           router.push({path: '/inventory/pearl_close_up', query: {id: item.value.sender}})
       } else if (action == "look_at_broken_pearl") {
           router.push({path: '/inventory/pearl_close_up', query: {id: 'شيطان'}})
       } else if (action == "display_target") {
         router.push({path: '/inventory/profile_view', query:{id: item.value.target}})
           userId.value = item.value.target;
           active_interaction.value = "user_display";
         close_drop();
       } else if (action == "accept_friendship") {
         fetch(backend + '/players/' + globalThis.id + '/acceptFrienshipRequest/' + item.value.sender, postRequestParams());
         close_drop();
         emit('reload_inventory')
       } else if (action == "reject_friendship") {
         fetch(backend + '/players/' + globalThis.id + '/declineFrienshipRequest/' + item.value.sender, postRequestParams());
         emit('reload_inventory')
         close_drop();
       } else if (action == "go_to_pong_match") {
         router.push({path: '/pong_match', query: {mode:1,id:item.value.match_id}})
         close_drop();
       } else if (action == "add_member") {
         active_interaction.value = "adding_member";
         close_drop();
       } else if (action == "time_ban") {
         active_interaction.value = "time_banning";
         close_drop();
       } else if (action == "destroy_chat") {
         close_drop();
         await fetch (backend + '/chats/' + item.value.chat_id, deleteRequestParams())
         emit('reload_inventory');
       } else if (action == "make_public") {
         close_drop()
         await fetch (backend + '/chats/' + item.value.chat_id + '/makePublic', postRequestParams())
         emit('reload_inventory');
       } else if (action == "unmake_public") {
         close_drop()
         await fetch (backend + '/chats/' + item.value.chat_id + '/makePrivate', postRequestParams())
         emit('reload_inventory');
       } else if (action == "exit_chat") {
         fetch(backend + /chats/ + globalThis.id + '/' + item.value.chat_id, deleteRequestParams()).then(() => {
            emit('reload_inventory');
          })
 	} else {
 		console.log("ERROR: Unrecognised option");
 	}
}

function close_sub_item_interaction() {
 	active_interaction.value = 'none';
}

function close_and_reload() {
  close_sub_item_interaction()
  emit('reload_inventory')
}

function set_password(password) {
    if (check_alpha_numeric(password) == true && password.length < 20)
    {
       fetch(backend+ "/chats/"+ item.value.chat_id + "/setPassword", {
           method: 'POST',
           mode: 'cors',
           headers: {
             "Content-Type": "application/json",
             'Accept': 'application/json',
              Authorization: "Bearer " + globalThis.logToken
           },
           body: JSON.stringify({password})
       }).then((r) => {
         console.log(r);
        });
       emit('reload_inventory')
    }
}

function unlock_password(password) {
    if (check_alpha_numeric(password) == true && password.length < 20)
    {
       try {
         fetch(backend + "/chats/"+ item.value.chat_id + "/unsetPassword", {
             method: 'POST',
             mode: 'cors',
             headers: {
               "Content-Type": "application/json",
               'Accept': 'application/json',
               Authorization: "Bearer " + globalThis.logToken
             },
             body: JSON.stringify({password})
           }).then((r) => {
               if (r.status == 201)
               {
                   emit('reload_inventory')
                   active_interaction.value = 'none';
               }
           });
       } catch (e) {
         console.log(e);
       }
    }
}

function unlock_padlock(password) {
    if (check_alpha_numeric(password) == true && password.length < 20)
    {
       try {
         fetch(backend + "/chats/"+ item.value.locked_item.chat_id + "/unlock/" + globalThis.id, {
             method: 'POST',
             mode: 'cors',
             headers: {
               "Content-Type": "application/json",
               'Accept': 'application/json',
               Authorization: "Bearer " + globalThis.logToken
             },
             body: JSON.stringify({password})
           }).then((r) => {
               if (r.status == 201)
               {
                   emit('reload_inventory')
                   active_interaction.value = 'none';
               }
           });
       } catch (e) {
         console.log(e);
       }
    }
}

function make_admin(member) {
       fetch(backend + "/chats/" + item.value.chat_id + "/admins/" + globalThis.id + '/riseToAdmin/' + member, postRequestParams()); 
 	active_interaction.value = 'none';
    emit('reload_inventory')
}

function unmake_admin(member) {
       fetch(backend + "/chats/" + item.value.chat_id + "/admins/" + globalThis.id + '/revokeAdmin/' + member, postRequestParams()); 
 	for (var i in item.value.admins) {
 		var a = item.value.admins[i];
 		if (a == member)
 			item.value.admins.splice(i, 1);
 	}
 	active_interaction.value = 'none';
    emit('reload_inventory')
}

function kick_member(member) {
       fetch(backend + "/chats/" + member + "/" + item.value.chat_id, deleteRequestParams()); 
 	for (var i in item.value.target) {
 		if (item.value.target[i] == member)
 			item.value.target.splice(i, 1);
 	}
 	for (var j in item.value.admins) {
 		if (item.value.admins[j] == member)
 			item.value.admins.splice(j, 1);
 	}
 	active_interaction.value = 'none';
    emit('reload_inventory')
}

function stop_displaying_user() {
     active_interaction.value = 'none'
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
