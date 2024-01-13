<template>
    <div style="width:100%;text-align:center;position:absolute;top:10vh;">
        <canvas ref="dummyGameCanvas" width="900" height="900" style="height:auto; width: 50%;margin: 0 auto;"></canvas>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'

const dummyGameCanvas = ref();

function animate() {
    const canvas = dummyGameCanvas.value;
    const ctx = canvas.getContext('2d');
    let x = 50;
    let y = 50;
    let velocityX = 2;
    let velocityY = 0;
    const gravity = 0.1;

    const drawBox = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillRect(x, y, 10, 10);
    };

    const updateBox = () => {
      velocityY += gravity;
      x += velocityX;
      y += velocityY;
      if (y > canvas.height - 10) {
        y = canvas.height - 10;
        velocityY = -velocityY * 0.8;
      }
      if (x > canvas.width - 10 || x < 0) {
        velocityX = -velocityX;
      }
    };

    const animateFrame = () => {
      updateBox();
      drawBox();
      requestAnimationFrame(animateFrame);
    };

    animateFrame();
}

onMounted( () => {
    animate();
});

</script>