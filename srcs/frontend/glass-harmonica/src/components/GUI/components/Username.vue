<template>
    <p class="edit_error_field" v-if="this.invalid_username">{{this.invalid_user_message}}</p>
    <div class="username_container">
        <h3 class="username_text" v-if='!this.editing'>{{username}}</h3>
        <textarea class="username_input" v-if='this.editing' v-model="new_username"></textarea>
        <EditField v-if="this.editable" @start_edit="start_edit" @cancel_edit="cancel_edit" @accept_edit="accept_edit"/>
    </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import EditField from './EditField.vue'

export default defineComponent({
  name: 'userName',
  props: ['username', 'editable'],
  components: {
    EditField
  },
  data () {
    return ({
      editing: false,
      new_username: '',
      invalid_username: false,
      invalid_user_message: 'Invalid user'
    })
  },
  methods: {
    start_edit () {
      this.editing = true
      this.new_username = this.username
    },
    accept_edit () {
      this.editing = false
      const regExp = /^([0-9]|[a-z])+([0-9a-z]+)$/i
      if (!this.new_username.match(regExp)) {
        this.invalid_username = true
        this.invalid_user_message = 'Only letters and numbers'
      } else if (this.username === this.new_username) {
        this.invalid_username = true
        this.invalid_user_message = 'Same username'
      } else {
        this.$emit('change_username', this.new_username)
        this.invalid_username = false
      }
    },
    cancel_edit () {
      this.editing = false
    }
  }
})

</script>

<style>
.username_container {
  display:flex;
}

.username_text {
  margin: 0.25em 3px;
}

.username_input {
  resize: none;
  height: 3em;
  width: 10em;
  border: solid;
  border-color: var(--border_color);
  border-radius: 6px;
  border-width: 4px;
  color:black;
  background-color: white;
}

.edit_error_field {
  color: red;
  margin: 0.2em;
}

</style>
