const Weapon = require('../../Classes/Weapon.js');
const { addModifier, dealDamage } = require("../combatantDAO.js");

module.exports = new Weapon("Sharpened Dagger", "A powerful attack that deals extra damage on a critical hit (crit: even more damage)", "wind", effect, [])
	.setTargetingTags({ target: "single", team: "enemy" })
	.setUses(10);

function effect(target, user, isCrit, element, adventure) {
	let damage = 140;
	if (user.element === element) {
		addModifier(target, "Stagger", 1);
	}
	if (isCrit) {
		damage *= 3;
	}
	return dealDamage(target, user, damage, element, adventure);
}
