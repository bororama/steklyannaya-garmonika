<template>
    <div class="overlay">
      <div class="instructions-box">
        <div class = "instructions-text">
          <h2>جَيَّان controls:<br></h2>
          Use WASD to move<br><br>
          Use Q and E to rotate the camera<br><br>
          If you need to respawn, use R<br><br>
          <h2>Pong controls:<br></h2>
          Use W↑ and S↓ <br><br>
          Change the background color with O and P          
        </div>

      </div>
    </div>
  </template>
  
  <script>
  
  import { backend, getRequestParams } from './connect_params'
  
  export default {
    name: "PongInstructions"
  };
  
  </script>
  
  <style>

  .instructions-box{
    width: 35%;
    height: 30%;
    background-color: #392919d5;
    margin: 0 auto;

  }

  .instructions-text{
    font-family: 'joystix';
  }

  </style>