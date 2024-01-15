<template>
    <div class=profile_image_container>
      <img v-if="!this.editing" class="avatar_image" :src="image">
      <input v-if="this.editing" class="avatar_image" type="file" @change="readFile" accept="image/*">
      <EditField v-if="this.editable" @start_edit="start_edit" @cancel_edit="cancel_edit" @accept_edit="accept_edit"/>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import defaultAvatar from '../assets/default_avatar.jpg'
import EditField from './EditField.vue'
import { backend, postRequestParams, getRequestParams} from './connect_params'

export default defineComponent({
  name: 'ProfileImage',
  props: ['editable', 'path', 'auto_image', "auto_image_path"],
  components: {
    EditField
  },
  data () {
    return ({
      image: defaultAvatar,
      editing: false,
      selected_image: ''
    })
  },
  created () {
    if (this.path !== undefined) {
      this.image = backend + '/' + this.path
    }
    if (this.auto_image) {
      let received_image = false
      this.await_auto_image()
    }
  },
  methods: {
    async await_auto_image() {
      let received_image = false
      while (received_image == false) {
        await new Promise( f=> setTimeout(f, 1000))
        console.log(backend + this.auto_image_path)
        fetch(backend + this.auto_image_path, getRequestParams).then((a) => {
          if (a.status != 404)
          {
            received_image = true
            setTimeout(f => {this.image = backend + this.auto_image_path}, 1000)
          }
        }).catch((e) => {
          received_image = false
        })
      }
    },
    getAvatarImage () {
      // TODO change "this.image" by requesting to server
    },
//    created () {
//      this.getAvatarImage()
//    },
    start_edit () {
      this.editing = true
    },
    cancel_edit () {
      this.editing = false
    },
    accept_edit () {
      this.editing = false
      this.$emit('change_profile_image', this.selected_image)
      //this.uploadImage()
    },
    readFile (event) {
      if (event.target.files[0] !== undefined) {
        this.selected_image = event.target.files[0]
        try {
          const newImage = URL.createObjectURL(event.target.files[0])
          this.image = newImage
        } catch (e) {
        }
      }
    }
  }
  })
</script>

<style>

.avatar_image {
  min-width: 10em;
  max-width: 24em;
  width: 20vw;
  min-height: 10em;
  max-height: 24em;
  width: 20vw;
  border:solid;
  border-width: 6px;
  border-color: var(--border_color);
  border-radius: 2px;
  margin: 1em;
  image-rendering:pixelated;
}

.profile_image_container {
  display: flex;
}

</style>
