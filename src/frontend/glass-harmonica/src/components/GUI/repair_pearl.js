import generate_pearl from './generate_pearl.js'

export default function repair_pearl(broken_pearl) {
	var pearl = generate_pearl(broken_pearl.sender, broken_pearl.target);
	//TODO: Notify server of repair
	return (pearl);
}
