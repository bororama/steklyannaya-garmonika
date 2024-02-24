<template>
	<div class="information_wrapper">
		<div class="information_background">
			<h3 class="information_title">INFORMATION</h3>
			<p class="information_paragraph"> {{ this.info_text }} </p>
		</div>
	</div>
</template>

<script>
export default {
	name: 'InformationPopup',
	props: ['info_text'],
}

</script>

<style>
.information_background {
	height:30vh;
	background-color: #392919;
	max-width: 1000px;
	min-width: 300px;
	margin: auto;
	border-radius: 0.2em;
	border-style: solid;
	border-color: #603f22;
    border-width: 1em;
    position: relative;
    top: 15vh;
}

.information_wrapper {
	margin:0;
}

.information_title {
	font-family: joystix;
	color:white;
	font-size: 2em;
	margin: 0.8em 0 0.5em 0;
	text-shadow: 2px 2px black;
}

.information_paragraph {
	font-family: joystix;
	color:white;
	font-size: 0.7em;
	padding: 0 10%;
	text-shadow: 1px 1px black,
		-1px -1px black;
}

</style>
