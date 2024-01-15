<template>
	<div class="overlay">
		<div class="messages_holder">
			<div class="message_wrapper">
					<div v-for="(member, index) in this.members" :key="index" class="one_message_container" :style="'animation-delay: ' + index * 0.15 + 's'">
						<li :class="{member: true, message: true, admin: member.isAdmin, owner: member.isOwner}" @click="this.$emit('user_interact', member.name) ">{{member.name}}</li>
					</div>
				<button class="close_popup" @click="this.$emit('close_interaction')">Close</button>
			</div>
		</div>
	</div>
</template>

<script>

export default {
	name: "ViewMembersPopup",
	props: ['members'],
}
</script>

<style>
.admin {
	color: red;
}

.owner {
	color: green;
}

.member {
	cursor: pointer;
}
</style>
