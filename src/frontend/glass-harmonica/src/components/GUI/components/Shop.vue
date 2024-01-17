<template>
    <div>
        <h1>متجر فرانسيسكو خيسوس دي جاتا إي فالديس</h1>
            <div class="shop">
                <div class="pearl">
                    <img src="../../../../public/items/collar.png">
                    <fa_button class="buycollar" @click="buyCollar">Collar - 4 FC</fa_button>
                </div>
                <div class="collar">
                    <img src="../../../../public/items/perla.png">
                    <fa_button class="buypearl" @click="buyPearl">Pearl - 1 FC</fa_button>
                </div>
                <div><img src="../../../../public/items/franciscoin.png"></div>
            </div>
    </div>
</template>

<script>
    export default {
      name: "Shop",
      data() {
        return {
          data: true,
        };
      },
      created() {
        //this.playMusic();
      },
      methods: {
        //playMusic(){
        //    let music = new Audio('src/frontend/glass-harmonica/src/components/GUI/components/shopMusic.mp3');
        //    music.muted = false;
        //    music.play();
        //},
        buyCollar() {
          console.log("Buying a collar");
        },
        buyPearl() {
          console.log("Buying a pearl");
        },
      },
    };
</script>

<style>

</style>
  