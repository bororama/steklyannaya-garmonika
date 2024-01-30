<template>
  <div class="global-shop overlay">
    <button  @click="() => {this.$emit('closeShop')}" class="fa_button">EXIT</button>
    <h1>متجر فرانسيسكو خيسوس دي جاتا إي فالديس</h1>
    <div class="shop-wrapper">
      <div>
        <img src="../../../../public/items/yellowDevil.png" class="devil-image">
        <p style="max-width: 30vw;">
          <br>{{ text }}
        </p>
      </div>
      <div class="shop">
        <div class="items">
          <div class="pearl">
            <img src="../../../../public/items/collar.png">
            <button class="fa_button" @click="buyNecklace">2 FC</button>
          </div>
          <div class="collar">
            <img src="../../../../public/items/perla.png">
            <button class="fa_button" @click="buyPearl">1 FC</button>
          </div>
          <div class="coins-container" style="border:none">
            {{ coins }} <img style="border:none" src="../../../../public/items/franciscoin.png">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getRequestParams, postRequestParams } from './connect_params'

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
    notEnoughCoins() {
      return ("Not enough franciscoins...");
    },
    randomText() {
      this.text = this.texts[Math.floor(Math.random() * this.texts.length)];
    },
    updateInfo() {
      console.log("IDDDDDDD" + globalThis.id)
      fetch(globalThis.backend + '/players/' + globalThis.id, getRequestParams()).then((answer) => {
        answer.json().then((player) => {
          this.coins = player.franciscoins;
          this.pearls = player.pearls;
          this.necklaces = player.necklaces;
          console.log(player);
        })
      })
    },
    buyNecklace() {
      fetch(globalThis.backend + '/tienda/buyNecklace/' + globalThis.id, postRequestParams()).then((answer) => {
        answer.text().then((status) => {
          if (status == 'ok') {
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
      fetch(globalThis.backend + '/tienda/buyPearl/' + globalThis.id, postRequestParams()).then((answer) => {
        answer.text().then((status) => {
          if (status == 'ok') {
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
.global-shop {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: 0 auto;
  font-family: 'joystix';
}

.devil-image {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 350px;
  width: 100%;
  height: auto;
  border: solid;
  border-width: 6px;
  border-color: var(--border_color);
  border-radius: 2px;
  margin: 0 auto;
  image-rendering: pixelated;
  justify-content: center;
}

.shop {
  margin-top: 8px;
}

.shop-wrapper {
  display: flex;
}

.coins-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 2.5em;
  column-gap: 16px;
  width: 100px;
}

.coins-container img {

}

/* Alineación horizontal de las imágenes y botones */
.items,
.item-container,
.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}


.items>div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.items img {
  padding: 6px;
  border: solid 4px var(--border_color);
  width: 100px;
}


@media screen and (max-width : 600px) {
  .items img {
    width: 42px;
  }

  .coins-container img {
    width: 50px;
  }
}
</style>
