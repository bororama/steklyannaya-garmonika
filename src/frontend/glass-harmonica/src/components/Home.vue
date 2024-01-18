<style>
  #metaverse {
    position: absolute;
    left: 0;
    top: 0;
    height: 100vh;
    width: 100vw;
    background-color: rgba(0,0,0,0);
	image-rendering: pixelated;
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
	<label for="name">name:</label>
	<input  v-model="usernameRef" type="text" name="username" id="username" minlength="6" maxlenght="8" require>
	<button id="meta-birth" @click="metaBirth">be born in جَيَّان</button>
	<button id="random-name" @click="usernameRef = getRandomUsername()">name roll</button>
	<h1>Sólo en el curroverso</h1>
	<h2>Sólo en el curroverso</h2>
	<h3>Sólo en el curroverso</h3>
	<DummyStore v-if="store" />
	<Metaverse v-if="playerIsBorn" @profileRequest="metaProfileHandler" @storeRequest="storeHandler"/>
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
  	<router-view></router-view>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { Socket, io } from "socket.io-client";
import Metaverse from './Metaverse.vue';
import ProfilePage from './ProfilePage.vue';
import DummyGame from './DummyGame.vue';
import DummyStore from './DummyStore.vue';
import {getRandomUsername, numberIsInRange} from './metaverse/utils';
import { useRouter } from 'vue-router';

const playerIsBorn = ref(false);
const store = ref(false)
const usernameRef = ref('');
const profile = ref({display : false, userId : ''});
const router = useRouter();


function metaBirth(e) {
	e.preventDefault();
	if (numberIsInRange(usernameRef.value.length, 6, 9)) {
		globalThis.username = usernameRef.value;
		playerIsBorn.value = true;
	}
}

function metaProfileHandler(metadata) {
	router.push({
        name : 'profile',
        params : { userId : metadata.name },
    });
}

function storeHandler(metadata) {
	store.value = true;
}

</script>