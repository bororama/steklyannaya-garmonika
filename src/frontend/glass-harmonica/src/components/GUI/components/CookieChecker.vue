<template>
    <div>
        <textarea v-model='code2fa' v-if="needs2fa"></textarea>
        <button @click="send_with_code" v-if="needs2fa">Send</button>
        <h1 v-if="wrong_code">WRONG CODE</h1>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { backend, getRequestParams, postRequestParams } from './connect_params'

export default defineComponent({
  name: 'CookieChecker',
  data () {
    return ({
      needs2fa: false,
      code2fa: '',
      fa_token: '1234',
      wrong_code: false
    })
  },
  created () {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('code') === null) {
      window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-b16e1d817c759a4768523eda7110974f45570d769c4180e352137a7aeb4a5ee7&redirect_uri=http%3A%2F%2Flocalhost%3A5173&response_type=code'
    } else if (urlParams.get('code') !== null) {
      const code : any = urlParams.get('code')
      this.try_log(code)
    }
  },
  methods: {
    send_with_code () {
      const myData :any = postRequestParams
      myData.body = JSON.stringify({
        fa_token: this.fa_token,
        code: this.code2fa,
      })
      fetch(backend + '/log/with_fa', myData).then((r) => {
        r.json().then((answer) => {
          if (answer.status === 'ok') {
            globalThis.logToken = answer.token
            fetch(backend + '/log/me/' + answer.token, getRequestParams).then((a) => {
              a.json().then((player) => {
                globalThis.id = player.id
                globalThis.my_data = player
                globalThis.username = player.name
                globalThis.is_admin = player.is_admin
                this.$emit('log_success', answer.token)
                this.needs2fa = false
              })
            })
          }
          if (answer.status === "ko") {
              this.wrong_code = true
          } else if (access.status === 'already_connected') {
            this.$emit('already_connected')
          }
        })
      })
    },
    try_log (code:string) {
      fetch('http://localhost:3000/log/code/' + code).then((r) => {
        r.json().then((access) => {
          if (access.status === 'ko') {
            window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-b16e1d817c759a4768523eda7110974f45570d769c4180e352137a7aeb4a5ee7&redirect_uri=http%3A%2F%2Flocalhost%3A5173&response_type=code'
          } else if (access.status === 'needs_register') {
            this.$emit('register', access)
          } else if (access.status === 'success') {
            globalThis.logToken = access.log_token
            fetch(backend + '/log/me/' + access.log_token, getRequestParams).then((a) => {
              a.json().then((player) => {
                globalThis.id = player.id
                globalThis.my_data = player
                globalThis.username = player.name
                this.$emit('log_success', access.log_token)
              })
            })
          } else if (access.status === 'needs_2fa') {
            this.needs2fa = true
            globalThis.has2FA = true
            this.fa_token = access.fa_token
          } else if (access.status === 'already_connected') {
            this.$emit('already_connected')
          }
        })
      })
    }
  }
})  
</script>
