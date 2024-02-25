<template>
    <div class="profile_container">
        <StatsDisplay v-if="display_status != 'registering' && loaded" :username="username"/>
        <MatchHistory v-if="display_status != 'registering' && loaded" :userId="matchUserId"/>
        <div class="personal_data_wrapper">
            <div :class="{personal_data:true, float_right:display_status != 'registering'}">
                <div class=status_profile_pair>
                    <StatusPearl v-if="display_status == 'profile_display'" :username="this.userId" @user_status_update="update_user_status"/>
                    <ProfileImage v-if="loaded" :editable="display_status =='registering' || display_status == 'my_profile'" :path="player_data.profilePic" :auto_image="display_status =='registering'" :auto_image_path="auto_image" @change_profile_image="changeImage" @auto_image_loaded="allow_register"/>
                </div>
                <Username :username="this.username" :editable="display_status == 'registering' || display_status == 'my_profile'" @change_username="changeUsername"/>
                <div class="float_left">
                    <Enabler2FA v-if="display_status != 'registering' && display_status != 'profile_display'"/>
                    <button class="compressed_button" v-if="display_status == 'profile_display' && !is_blocked && !is_friend && !is_potential_friend" @click="befriend">Sneak Pearl</button>
                    <button class="compressed_button" v-if="display_status == 'profile_display' && !is_blocked" @click="block">Block</button>
                    <button class="compressed_button" v-if="display_status == 'profile_display' && !is_blocked && is_friend && online_status == 'online' && !unmatchable" @click="match">Match</button>
                    <button class="compressed_button" v-if="display_status == 'profile_display' && !is_blocked && is_friend && online_status == 'online' && !unmatchable" @click="match_boundless">Boundless</button>
                    <button class="compressed_button" v-if="display_status == 'profile_display' && !is_blocked && is_friend && online_status == 'in_match'" @click="spectate">Spectate</button>
                </div>
            </div>
            <h3 v-if="not_enough_pearls">Not enough pearls</h3>
        </div>
    </div>
    <h3 class="edit_error_field" v-if="already_registered">Username already in use</h3>
    <button class='fa_button' v-if="display_status == 'registering' && can_register" @click="registerUser">Descend to جَيَّان</button>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import StatsDisplay from './StatsDisplay.vue'
import StatusPearl from './StatusPearl.vue'
import ProfileImage from './ProfileImage.vue'
import Username from './Username.vue'
import MatchHistory from './MatchHistory.vue'
import Enabler2FA from './Enabler2FA.vue'
import { postRequestParams, getRequestParams } from './connect_params'

export default defineComponent({
  name: 'ProfilePage',
  props: ['display_status', 'register_token', 'userId', 'auto_image', 'unmatchable'],
  components: {
    StatsDisplay,
    StatusPearl,
    ProfileImage,
    Username,
    MatchHistory,
    Enabler2FA
  },
  data () {
    return ({
      username: 'Username',
      image: 'no_image',
      loaded: false,
      player_data: {},
      is_blocked: false,
      is_friend: false,
      is_potential_friend: false,
      online_status: 'disconnected',
      matchUserId: '0',
      can_register: false,
      not_enough_pearls: false,
      already_registered: false
    })
  },
  methods: {
    async upload_and_emit(registerAnswer) {
      console.log({tut: "Hola", yup: "Adios"})
       const param = postRequestParams()
       const formData = new FormData()
       await formData.append('image', this.image)
       globalThis.logToken = registerAnswer.meta_token
       param.body = formData
       param.headers = {
           Authorization: 'Bearer ' + globalThis.logToken
       }
       console.log(param)
       await fetch(backend + '/users/' + this.username  + '/uploadProfilePic', param)
       this.$emit('successful_register', registerAnswer.meta_token)
    },
    registerUser () {
      const myData : any = postRequestParams()
      myData.body = JSON.stringify({
        username: this.username,
        register_token: this.register_token,
      })
      fetch(backend + '/log/register', myData).then((r) => {
        if (r.status == 400) {
           this.already_registered = true
        } else {
          r.json().then((registerAnswer) => {
            if (registerAnswer.status === 'ok') {
              globalThis.logToken = registerAnswer.meta_token
              if (this.image != 'no_image')
              {
                 this.upload_and_emit(registerAnswer);
              } else {
                  this.$emit('successful_register', registerAnswer.meta_token)
              }
            }
          })
        }
      })
    },
    changeUsername (newUsername : string) {
      if (this.display_status != 'registering')
      {
        fetch(backend + '/changeUsername/' + this.username + '/' + newUsername, postRequestParams()).then((a) => {
          if (a.status == 400) {
            this.already_registered = true
          }
        })
      }
      this.username = newUsername
      globalThis.username = newUsername
      let param = postRequestParams()
    },
    changeImage(new_image:string) {
      if (this.display_status != 'registering')
      {
        const formData = new FormData()
        console.log(new_image)
        formData.append('image', new_image)
        let param = postRequestParams()
        param.body = formData
        param.headers = {
          Authorization: 'Bearer ' + globalThis.logToken
        }
        console.log(param)
        fetch(backend + '/users/' + globalThis.id + '/uploadProfilePic', param)
      } else {
        this.image = new_image
      }
    },
    befriend () {
      fetch (globalThis.backend + '/players/' + globalThis.id + '/giftPearlTo/' + this.userId, postRequestParams()).then((r) => {
        r.text().then((a) => {
          if (a === 'not_enough_pearls') {
            this.not_enough_pearls = true
          } else if (a === 'ok') {
            this.is_potential_friend = true
          }
        })
      })
    },
    block() {
      fetch (globalThis.backend + '/' + globalThis.id + '/blocks/' + this.userId, postRequestParams()).then((r) => {
        this.is_blocked = true
      })
    },
    match () {
      fetch (backend + '/matches/' + globalThis.id + '/challenge/' + this.userId, postRequestParams()).then((a) => a.json().then((created_match) => {
        console.log(created_match)
        this.$router.push({path: '/pong_match', query:{mode:0, id:created_match.roomId}})
      }))
    },
    match_boundless () {
      fetch (backend + '/matches/' + globalThis.id + '/challenge/' + this.userId, postRequestParams()).then((a) => a.json().then((created_match) => {
        this.$router.push({path: '/pong_match', query:{mode:1, id:created_match.roomId}})
      }))
    },
    spectate () {
      console.log(this.player_data.matchRoomId)
      const match : any = {
        "match_id": this.player_data.matchRoomId
      }
      this.$emit('start_match', match)
    },
    update_user_status (new_status : string) {
      this.online_status = new_status
    },
    allow_register () {
      this.can_register = true
    }
  },
  created () {
    if (globalThis.logToken != undefined && this.userId === undefined)
    {
      fetch(globalThis.backend + '/log/me/', {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer ' + logToken
        }
      }).then((a) => {
        a.json().then((player) => {
          console.log(player)
          globalThis.id = player.id
          globalThis.my_data = player
          globalThis.is_admin = player.isAdmin
          this.player_data = player
          this.username = player.name
          this.matchUserId = globalThis.id
          this.loaded = true
        })
      })
    } else if (this.userId !== undefined) {
      const myData : any = getRequestParams()
      this.matchUserId = this.userId
      fetch (globalThis.backend + '/players/' + this.userId, myData).then((a) => {
        a.json().then((player) => {
          this.player_data = player
          this.username = player.name
          this.is_friend = false
          fetch (globalThis.backend + '/' + globalThis.id + '/blocks', getRequestParams()).then((a) => {
            a.json().then((blocks) => {
              for (const b in blocks)
              {
                if (blocks[b].username ==  player.username)
                  this.is_blocked = true;
              }
            })
          })
          fetch (globalThis.backend + '/players/' + globalThis.id + '/isFriend/' + this.userId, getRequestParams()).then((a) => {a.text().then((isFriend) => {
                if (isFriend == 'yes')
                  this.is_friend = true
            })
          })
          fetch (globalThis.backend + '/players/' + globalThis.id + '/getFrienshipRequests', getRequestParams()).then((a) => {
            a.json().then((pfriends) => {
              for (const f in pfriends) {
                if (pfriends[f].id == this.userId || pfriends[f].name == this.userId)
                {
                  this.is_potential_friend = true
                }
              }
              setTimeout(() => {this.loaded = true}, 10)
            })
          })
        })
      })
    } else {
      this.loaded = true
    }
  }
})
</script>

<style>

.profile_container {
  display: flex;
  flex: 33vw;
  font-family: joystix;
}

.personal_data_wrapper {
  width:100%;
}

.personal_data {
  margin: 0 0.5em;
}

.float_right {
  float:right;
}

.float_left {
  float: left;
  text-align: left;
}

.status_profile_pair {
    display: flex;
}

.compressed_button {
  border: solid;
  border-radius: 2px;
  border-width: 3px;
  width: 7em;
  height: 2.3em;
  color: white;
  border-color: var(--border_color);
  background-color: var(--pop_background);
  cursor: pointer;
  margin: 0.3em;
}

.compressed_button:hover {
  background: var(--select_light)
}

</style>
