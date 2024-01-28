<template>

<img class="inventory_button" :src="this.current_image" @click="toggle_inventory">


</template>

<script>
import Bolsa1 from "../assets/Bolsa1.png"
import Bolsa2 from "../assets/Bolsa2.png"
import Bolsa3 from "../assets/Bolsa3.png"
import Bolsa4 from "../assets/Bolsa4.png"

export default {
	name: "ButtonedInventory",
	data () {
		return ({
			inventory_opened: false,
			bolsa: [Bolsa1, Bolsa2, Bolsa3, Bolsa4],
			current_image: null
		});
	},
	methods: {
		close_inventory () {
			this.inventory_opened = false;
		},
		toggle_inventory () {
            const animation_delay = 60;
			if (!this.inventory_opened)
            {
              this.$emit('inventory_open')
              this.current_image = this.bolsa[1]
              setTimeout(() => {this.current_image = this.bolsa[2]}, animation_delay);
              setTimeout(() => {this.current_image = this.bolsa[3]}, animation_delay * 2);
              setTimeout(() => {this.inventory_opened = !this.inventory_opened;}, animation_delay * 3);
            }
			else
            {
              this.$emit('inventory_close')
              this.inventory_opened = !this.inventory_opened;
              setTimeout(() => {this.current_image = this.bolsa[2]}, animation_delay);
              setTimeout(() => {this.current_image = this.bolsa[1]}, animation_delay * 2);
              setTimeout(() => {this.current_image = this.bolsa[0]}, animation_delay * 3);
            }
		}
	},
	created () {
		this.current_image = this.bolsa[0]
	}
}
</script>

<style>

.inventory_button {
	width: 100px;
	height: 100px;
	cursor: pointer;
}

</style>
