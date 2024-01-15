import generate_rosary from "./generate_rosary.js"

export default function repair_rosary(broken_rosary) {
	var rosary = generate_rosary(broken_rosary.target, broken_rosary.sender, broken_rosary.owner, broken_rosary.admins);
	//TODO inform server of breaking
	return (rosary);
}
