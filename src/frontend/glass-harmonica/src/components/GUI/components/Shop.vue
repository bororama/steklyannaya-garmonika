<template>
  <div>
    <h1>متجر فرانسيسكو خيسوس دي جاتا إي فالديس</h1>
    <div>
      <img src="../../../../public/items/ShopPlaceholder.jpeg" class="image">
      {{ text }}
    </div>
    <div class="shop">
      <div class="coins-container">
        {{ coins }} x <img class="mini" src="../../../../public/items/franciscoin.png">
      </div>
      <div class="pearl">
        <div class="item-container">
          <img src="../../../../public/items/collar.png" class="mini">
        </div>
        <div class="button-container">
          <button class="fa_button" @click="buyNecklace">4 FC</button>
        </div>
      </div>
      <div class="collar">
        <div class="item-container">
          <img src="../../../../public/items/perla.png" class="mini">
        </div>
        <div class="button-container">
          <button class="fa_button" @click="buyPearl">FC</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { backend, getRequestParams, postRequestParams } from './connect_params'

    export default {
      name: "Shop",
      data() {
        return {
          data: true,
          coins: 0,
          necklaces: 0,
          pearls: 0,
          text: "Welcome",
          texts: [],
        };
      },
      created() {
        globalThis.id = 1; // QUITAR
        this.texts = [
          '42:19 Allah is Subtle with His servants; He gives provisions to whom He wills. And He is the Powerful, the Exalted in Might.',
          '45:15 Whoever does a good deed - it is for himself; and whoever does evil - it is against the self. Then to your Lord you will be returned.',
          '67:10 And they will say, "If only we had been listening or reasoning, we would not be among the companions of the Blaze."',
          'Thanks for your purchase friend.',
          'Thanks hehe'
        ];
        this.updateInfo();
        //this.playMusic();

      },
      methods: {
        randomText(){
          this.text = this.texts[Math.floor(Math.random()* this.texts.length)];
        },
        updateInfo() {
          fetch(backend + '/players/' + globalThis.id, getRequestParams).then((answer) => {
          answer.json().then((player) => {
            this.coins = player.franciscoins;
            this.pearls = player.pearls;
            this.necklaces = player.necklaces;
            console.log(player);
          })
        })
        },
        buyNecklace() {
          fetch(backend + '/tienda/buyNecklace/' + globalThis.id, postRequestParams);
          setTimeout(() => {
            this.updateInfo();
          }, 50);
          this.randomText();
          console.log("Buying a necklace");
        },
        buyPearl() {
          fetch(backend + '/tienda/buyPearl/' + globalThis.id, postRequestParams);
          setTimeout(() => {
              this.updateInfo();
          }, 50);
          this.randomText();
          console.log("Buying a pearl");
        },
      },
    };
</script>

<style>
div {
  margin: 10%;
}

.image {
  width: 100%;
  height: auto;
  border: solid;
  border-width: 6px;
  border-color: var(--border_color);
  border-radius: 2px;
  margin: 1em;
  image-rendering: pixelated;
}

.mini {
  width: 25%;
  margin: 1.4em;
}

.coins-container {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5em;
}

/* Alineación horizontal de las imágenes y botones */
.item-container,
.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar_image {
  min-width: 10em;
  max-width: 24em;
  width: 20vw;
  min-height: 10em;
  max-height: 24em;
  width: 20vw;
  border: solid;
  border-width: 6px;
  border-color: var(--border_color);
  border-radius: 2px;
  margin: 1em;
  image-rendering: pixelated;
}
</style>