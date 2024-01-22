<template>
    <div class="edit_field_container">
        <img class="edit_field_button" v-if="!this.editing" :src="edit_image" @click="start_editing()">
        <img class="edit_field_button" v-if="this.editing" :src="check_image" @click="accept_edit()">
        <img class="edit_field_button" v-if="this.editing" :src="cross_image" @click="cancel_editing()">
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import pencilImage from '../assets/Pencil.png'
import checkImage from '../assets/Check.png'
import crossImage from '../assets/Cross.png'

export default defineComponent({
  name: 'EditField',
  props: [],
  data () {
    return ({
      editing: false,
      edit_image: pencilImage,
      check_image: checkImage,
      cross_image: crossImage,
      my_username: this.username,
      new_username: this.my_username,
      invalid_username: false,
      invalid_user_message: 'Invalid user'
    })
  },
  methods: {
    start_editing () {
      this.editing = true
      this.$emit('start_edit')
    },
    accept_edit () {
      this.editing = false
      this.$emit('accept_edit')
    },
    cancel_editing () {
      this.editing = false
      this.$emit('cancel_edit')
    }

  }
})

</script>

<style>
.edit_field_button {
  width: 25px;
  height: 25px;
  cursor: pointer;
}

.edit_field_container {
  display:flex
}

</style>
