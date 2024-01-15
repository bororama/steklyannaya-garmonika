import generate_broken_rosary from "./generate_broken_rosary.js"

export default function break_rosary(rosary) {
	var broken_rosary = generate_broken_rosary(rosary.target, rosary.sender, rosary.owner, rosary.admins);
	//TODO inform server of breaking
	return (broken_rosary);
}
