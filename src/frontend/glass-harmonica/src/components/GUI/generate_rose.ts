export default function generate_rose(sender: string, recipient: string) {
  return (
    {
      "item_type": "rose",
      "image": "rosa.png",
      "options": [
        {"text": "Discover Lover", "action": "display_sender"},
        {"text": "Love back", "action": "accept_friendship"},
        {"text": "Dismiss lover", "action": "reject_friendship"},
        {"text": "Close", "action": "close_drop"}
      ],
      "sender": sender,
      "target": recipient,
      "description": "You don't recall where you found this pearl."
    })
}
