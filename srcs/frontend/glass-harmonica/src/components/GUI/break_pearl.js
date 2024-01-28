import generate_broken_pearl from './generate_broken_pearl.js'

export default function break_pearl(pearl) {
	var broken_pearl = generate_broken_pearl(pearl.sender, pearl.target);
	//TODO inform server of the breaking
	return (broken_pearl);
}
