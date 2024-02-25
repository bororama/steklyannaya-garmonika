<template>
    <div class="overlay">
      <div class="instructions-box">
        <div class = "instructions-text">
          <h2>جَيَّان controls:<br></h2>
          Use WASD to move<br><br>
          Use Q and E to rotate the camera<br><br>
          If you need to respawn, use SHIFT + R<br><br>
          <h2>PONG</h2>
          To play a public match, say PING or PONG<br>
          You can play private matches by challenging a friend through your profile page<br>
          <h3>Pong controls:<br></h3><br>
          Use W↑ and S↓ <br><br>
          Change the background color with O and P.
          You may exit this page by using your browser's history navigation arrows.
        </div>

      </div>
    </div>
  </template>
  
  <script>
  
  import { getRequestParams } from './connect_params'
  
  export default {
    name: "PongInstructions"
  };
  
  </script>
  
  <style>

  .instructions-box{
    width: 35%;
    height: auto;
    background-color: #392919d5;
    margin: 0 auto;
    padding: 8px;

  }

  .instructions-text{
    font-family: 'joystix';
  }

  </style>
