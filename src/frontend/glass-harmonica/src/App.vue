<style>
  canvas {
    position: absolute;
    left: 0;
    top: 100px;
    height: calc(50% - 100px);
    width: 100%;
    background-color: rgba(0,0,0,0);
  }
  span, button {
    font: 12pt Arial;
  }
  h1 {
    font-family: Arial;
  }

  body{
    width:100%;
    height:100%;
  }
</style>

<template>
	<span>Username: </span><input type="text" id="username">&nbsp;&nbsp;
	<button id="login" onclick="UI.login()">Log-in</button>
    <h1>Sólo en el curroverso</h1>
	<h2>Sólo en el curroverso</h2>
	<h3>Sólo en el curroverso</h3>
	<h4>Sólo en el curroverso</h4>
	<h5>Sólo en el curroverso</h5>
	<h6>Sólo en el curroverso</h6>
	<h6>Sólo en el currovers</h6>
	<h6>Sólo en el currover</h6>
	<h6>Sólo en el currove</h6>
	<h6>Sólo en el currov</h6>
	<h6>Sólo en el curro</h6>
	<h6>Sólo en el curr</h6>
	<h6>Sólo en el cur</h6>
	<h6>Sólo en el curr</h6>
	<h6>Sólo en el curro</h6>
	<h6>Sólo en el curr</h6>
	<h6>Sólo en el cur</h6>
	<h6>Sólo en el curr</h6>
	<h6>Sólo en el cur</h6>
	<h6>Sólo en el cu</h6>
	<h6>Sólo en el </h6>
	<h6>Sólo en e</h6>
	<h6>Sólo en </h6>
	<h6>Sólo e</h6>
	<h6>Sólo</h6>
	<h6>S ó l o</h6>
	<h6>S . ó . l . o</h6>
	<h6>Sólo curro</h6>
	<BabylonScene :metaSocket="metaSocket" />
	<ConnectionManager :metaSocket="metaSocket" />
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { Socket, io } from "socket.io-client";
import BabylonScene from './components/BabylonScene.vue';
import ConnectionManager from './components/ConnectionManager.vue';
import { ServerToClientEvents, ClientToServerEvents, Messsage} from "./metaverse/meta.interface.ts";



const metaSocket : Ref<Socket> = ref(initializeSocket());

function initializeSocket() : Socket {

	return io<ServerToClientEvents, ClientToServerEvents>(`http://${import.meta.env.VITE_HOST_IP}:3000`);
}


</script>

