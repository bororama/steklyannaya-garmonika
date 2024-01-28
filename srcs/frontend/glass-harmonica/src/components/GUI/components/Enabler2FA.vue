<template>
    <button class="fa_button" v-if="!enabled && !enabling" @click="enable" >Enable 2FA</button>
    <div class="qr_cage"  v-if="enabling && not_enabled">
        <img class="qr_code_image" :src="qr_image">
        <h3 class="fa_confirm_title" >Input Code To Confirm</h3>
        <p v-if="wrong_code">Wrong code</p>
        <textarea class="fa_code_input" v-model="input_code"></textarea>
        <button class="fa_button" @click="confirm_enable">Send Code</button>
    </div>
    <h3 v-if="!not_enabled && enabling">2FA ENABLED</h3>
    <p v-if="wrong_code && enabled">Wrong code</p>
    <textarea class="fa_code_input" v-if="enabled" v-model="input_code"></textarea>
    <button class="fa_button" v-if="enabled" @click="disable2fa">Disable 2FA</button>
</template>

<script>

import { defineComponent } from 'vue'
import QRNotReceived from '../assets/QR_no_recibido.png'
import { backend, postRequestParams } from './connect_params.ts'

export default defineComponent({
  name: 'Enabler2FA',
  data () {
    return ({
      // TODO get from the server
      enabled: globalThis.has2FA,
      enabling: false,
      qr_image: QRNotReceived,
      input_code: '',
      not_enabled: true,
      wrong_code: false
    })
  },
  methods: {
    enable () {
      this.enabling = true
      fetch(backend + '/log/generate2FASecret/' + globalThis.logToken).then((r) => {
        r.json().then((answer) => {
          if (answer.qr !== undefined) {
            this.qr_image = answer.qr
          }
        })
      })
    },
    confirm_enable () {
      const data = postRequestParams()
      data.body = JSON.stringify({
        token: globalThis.logToken,
        code: this.input_code
      })
      fetch(backend + '/log/confirm2FA', data).then((r) => {
        r.text().then((answer) => {
          if (answer === 'ok') {
            this.not_enabled = false
            this.enabling = true
          } else if (answer === 'ko') {
            this.wrong_code = true
          }
        })
      })
    },
    disable2fa () {
      const data = postRequestParams()
      data.body = JSON.stringify({
        token: globalThis.logToken,
        code: this.input_code
      })
      fetch(backend + '/log/disable2FA', data).then((r) => {
        r.text().then((answer) => {
          if (answer === 'ok') {
            this.not_enabled = true
            this.enabled = false
          } else if (answer === 'ko') {
            this.wrong_code = true
          }
        })
      })
    }
  }
})

</script>

<style>

.qr_code_image {
  width: 200px;
  height: 200px;
}

.fa_code_input {
    resize: none;
    width: 6em;
    height: 2.5em;
    border: solid;
    border-color: var(--border_color);
    border-radius: 6px;
    color: black;
    background-color: white;
}

.fa_button {
  border: solid;
  border-radius: 2px;
  border-width: 3px;
  width: 12em;
  height: 2.3em;
  color: white;
  border-color: var(--border_color);
  background-color: var(--pop_background);
  cursor: pointer;
  margin: 1em;
  font-family: joystix;
}

.fa_button:hover {
  background: var(--select_light)
}

.fa_confirm_title {
  margin: 0;
}

</style>
