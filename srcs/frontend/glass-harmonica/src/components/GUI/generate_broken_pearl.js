export default function generate_broken_pearl(sender, target) {
	return ({
		"item_type": "broken_pearl",
		"image": "perla_rota.png",
		"options": [
			{"text": "Close up", "action": "look_at_pearl"},
			{"text": "Reunite", "action": "unban"},
			{"text": "Close", "action": "close_drop"}
		],
		"target": target,
		"sender": sender,
		"description": "To become close to someone is to give a person the chance to hurt you. It seems that one of you has not lived up to that responsability. The pearl has lost it's brightness and looks crestfallen, devoid of purpouse. A profound sadness engulfs you as you observe the pieces."
	}
	);
}
