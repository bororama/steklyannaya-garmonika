<template>
  <div class="global">
    <h1>متجر فرانسيسكو خيسوس دي جاتا إي فالديس</h1>
    <div>
      <img src="../../../../public/items/ShopPlaceholder.jpg" class="image">
      <br>{{ text }}
    </div>
    <div class="shop">
      <div class="items">
        <div class="pearl">
            <img src="../../../../public/items/collar.png" class="mini">
            <button class="fa_button" @click="buyNecklace">2 FC</button>
        </div>
        <div class="collar">
            <img src="../../../../public/items/perla.png" class="mini">
            <button class="fa_button" @click="buyPearl">1 FC</button>
        </div>
    </div>
    <div class="coins-container">
        {{ coins }} x <img class="mini" src="../../../../public/items/franciscoin.png">
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

          text: "Welcome to my bazaar.",
          texts: [],
        };
      },
      created() {
        globalThis.id = 1; // QUITAR
        this.texts = [
          'Give your friends your money and your blood, but don’t justify yourself. Your enemies won’t believe it and your friends won’t need it.',
          'Everyone is critical of the flaws of others, but blind to their own',
          'Good health is a crown worn by the healthy than only the ill can see.',
          'The wisest is the one who can forgive.',
          'Forgetting is the plague of knowledge.',
          'In haste there is regret, but in patience and care there is peace and safety.',
          'The envious were created just to be infuriated.',
          'Thanks for your purchase friend.',
          'Thanks hehe',
          'Meow'
        ];
        this.updateInfo();

      },
      methods: {
        notEnoughCoins(){
          return ("Not enough franciscoins...");
        },
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
          fetch(backend + '/tienda/buyNecklace/' + globalThis.id, postRequestParams).then((answer) => {
            answer.text().then((status) => {
              if (status == 'ok'){
                setTimeout(() => {
                  this.updateInfo();
                }, 50);
                this.randomText();
                console.log("Buying a necklace");        
              }
              else
                this.text = this.notEnoughCoins();
            })
          });
        },
        buyPearl() {
          fetch(backend + '/tienda/buyPearl/' + globalThis.id, postRequestParams).then((answer) => {
            answer.text().then((status) => {
              if (status == 'ok'){
                setTimeout(() => {
                  this.updateInfo();
                }, 50);
                this.randomText();
                console.log("Buying a pearl");        
              }
              else
                this.text = this.notEnoughCoins();
            })
          });
        },
      },
    };
</script>

<style>
.global {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  max-width: 20vh;
  margin: 0 auto;
}
div {
  margin: 10%;
}

.image {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 30vh;
  width: 100%;
  height: auto;
  border: solid;
  border-width: 6px;
  border-color: var(--border_color);
  border-radius: 2px;
  margin: 1em;
  image-rendering: pixelated;
  justify-content: center;
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
.items,
.item-container,
.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
}




</style>