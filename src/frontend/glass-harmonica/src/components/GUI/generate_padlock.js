export default function generate_padlock(locked_item, password) {
	return (
	{
		"item_type": "padlock",
		"image": "padlock.png",
		"options": [
			{"text": "Unlock", "action": "enter_password"},
			{"text": "Close", "action": "close_drop"}
		],
		"description": "Previously open, now closed. The fear of the public. The sentiments that might be revealed, the secrets that might be shared.",
		"locked_item": locked_item,
		"password":password
	}
	);
}
