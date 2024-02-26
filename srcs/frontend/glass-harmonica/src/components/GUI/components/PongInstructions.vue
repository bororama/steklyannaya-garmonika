<template>
    <div class="overlay">
      <div class="instructions-box">
        <div class = "instructions-text">
          <h2>جَيَّان controls:<br></h2>
          Use WASD to move<br><br>
          Use Q and E to rotate the camera<br><br>
          Use T to open the chat prompt and talk with everyone<br><br>
          Use ENTER to send the Message and ESC to close the prompt<br><br>
          If you need to respawn, use CTRL + SHIFT + R<br><br>
          <h2>PONG</h2>
          To play a public match, say PING or PONG on the public chat<br>
          (Please, write it in capitalized)<br><br>
          You can also play private matches by challenging a friend through their profile page<br>
          The first to score 7 points wins<br>
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
    overflow-y:auto;
    max-height: 70vh;
  }

  </style>
