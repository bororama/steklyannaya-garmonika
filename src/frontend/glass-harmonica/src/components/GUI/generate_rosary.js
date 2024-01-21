export default function generate_rosary(sender, id) {
	return (
	{
		"item_type": "rosary",
		"image": "collar.png",
		"owner_options": [
			{ "text": "Elevate low member", "action": "make_admin"},
			{ "text": "Lessen high member", "action": "unmake_admin"},
			{ "text": "Forget", "action": "destroy_chat"},
		],
		"admin_options": [
			{ "text": "Alienate member", "action": "kick_member"},
			{ "text": "Add Member", "action": "add_member"},
			{ "text": "Securize", "action":"add_password"},
		],
		"options": [
			{"text": "Send message", "action": "send_message"},
			{"text": "View messages", "action": "view_messages"},
			{"text": "Ignore relation", "action": "ban"},
			{"text": "Observe members", "action": "display_members"},
			{"text": "Close", "action": "close_drop"}
		],
		"sender": sender,
        "chat_id":id,
		"glow": false,
		"description": "Is it better to conect with the indvidual, or with the group? What makes for better phylosophical debate? You seem to have found your own answer..."
	}
	);
}
