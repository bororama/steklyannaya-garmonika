export default function generate_broken_rosary(targets, sender, owner, admins) {
	return ({
		"item_type": "broken_rosary",
		"image": "collar_roto.png",
		"options": [
			{"text": "Reunite", "action":"unban"},
			{"text": "Close", "action": "close_drop"}
		],
		"target": targets,
		"sender": sender,
		"owner": owner,
		"admins": admins,
		"glow": false,
		"description": "You refuse to listen. Even though the dancing people continue to chat all around you."
	});
}
