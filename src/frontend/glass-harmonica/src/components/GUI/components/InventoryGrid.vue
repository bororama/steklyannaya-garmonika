<template>

<div class="ItemDistributor">
	<InventoryItem v-for="(group,index) in groups" :key="index" @change_active_description="relay_description_change" :item_data="group"/>
	<InventoryItem v-for="(friendship_request,index) in frienship_requests" :key="index" @change_active_description="relay_description_change" :item_data="friendship_request" @close_inventory="close_inventory"/>
	<InventoryItem v-for="(friend,index) in friends" :key="index" @change_active_description="relay_description_change" :item_data="friend" @go_to_pong_match="(param) => {$emit('go_to_pong_match', param)}"/>
	<InventoryItem v-for="(block,index) in blocks" :key="index" @change_active_description="relay_description_change" :item_data="block"/>

</div>

</template>


<script>
import InventoryItem from './InventoryItem.vue'
import generate_pearl from '../generate_pearl.js'
import generate_rosary from '../generate_rosary.js'
import generate_rose from '../generate_rose.ts'
import break_pearl from '../break_pearl.js'
import { backend, getRequestParams, postRequestParams } from './connect_params'

export default {
	name: "InventoryGrid",
	components: {
		InventoryItem
	},
	data () {
		return ({
          groups: [],
          my_id: globalThis.id,
          frienship_requests: [],
          friends: [],
          blocks: [],
          offered_matches: []
		});
	},
	methods: {
		relay_description_change (new_description) {
			this.$emit('change_active_description', new_description);
		},
        close_inventory() {
          this.$emit('close_inventory')
        }
	},
    created() {
      fetch(backend + '/' + globalThis.id + '/chats', getRequestParams()).then((r) => {
        r.json().then((answer) => {
          for (const chat in answer) {
            let c = answer[chat]
            let rosary
            rosary = generate_rosary(globalThis.id, answer[chat].id)
            for (const u in c.users) {
              console.log(c.users[u])
              if (globalThis.id == c.users[u].id) {
                rosary.is_owner = c.users[u].isOwner
                rosary.is_admin = c.users[u].isAdmin
              }
            }
            if (c.isLocked)
                rosary = generate_padlock(rosary)
            this.groups.push(rosary)
          }
        })
      })
      fetch(backend + '/' + globalThis.id + '/blocks').then((r) => {
        r.json().then((answer) => {
            for (const blocked in answer)
                this.blocks.push(break_pearl(generate_pearl(globalThis.id, answer[blocked].name)))
            fetch(backend + '/players/' + globalThis.id + '/getFrienshipRequests').then((r) => {
              r.json().then((answer) => {
                for (const friend in answer) {
                  let is_blocked = false
                  for (const block in this.blocks) {
                    if (this.answer[friend].name == this.blocks[blocks].target) {
                        is_blocked = true
                    }
                  }
                  if (!is_blocked)
                    this.frienship_requests.push(generate_rose(answer[friend].name, globalThis.id))
                }
              })
            })
            fetch(backend + '/players/' + globalThis.id + '/getFriends').then((r) => {
              r.json().then((friends) => {
                fetch (backend + '/matches/' + globalThis.id).then((r) => {
                  r.json().then((matches) => {
                    for (const friend in friends) {
                      let is_blocked = false
                      for (const block in this.blocks) {
                        if (this.friends[friend].name == this.blocks[blocks].target) {
                            is_blocked = true
                        }
                      }
                      if (!is_blocked)
                      { 
                        let pearl = generate_pearl(globalThis.id, friends[friend].name)
                        pearl.chat_id = friends[friend].chat
                        let glow = 'none'
                          for (const match in matches) {
                            const m = matches[match]
                            if (m.endDate == null && (m.player1.id == friends[friend].id || m.player2.id == friends[friend].id || m.player1.name == friends[friend].id|| m.player2.name == friends[friend].id)) {
                              pearl.match_id = m.roomId
                              glow = 'match'
                            }
                          }
                          pearl.glow = glow
                          if (glow == 'match')
                          {
                            pearl.options.unshift({"text": "PONG!", "action": "go_to_pong_match"})
                            pearl.description = pearl.match_description
                          }
                        this.friends.push(pearl)
                      }
                    }
                  })
                })
              })
            })
       })
      })
    }
}

</script>

<style>
.ItemDistributor {
	margin: 0 5vw;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(140px, 140px));
}
</style>

