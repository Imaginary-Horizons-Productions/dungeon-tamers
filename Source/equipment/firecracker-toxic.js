const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const { dealDamage, addModifier } = require('../combatantDAO.js');
const { SAFE_DELIMITER } = require("../../constants.js");

module.exports = new EquipmentTemplate("Toxic Firecracker", "*Strike 3 random foes applying @{mod1Stacks} @{mod1} and @{damage} @{element} damage*\nCritical Hit💥: Damage x@{critBonus}", "Fire", effect, ["Double Firecracker", "Mercurial Firecracker"])
	.setCategory("Weapon")
	.setTargetingTags({ target: `random${SAFE_DELIMITER}3`, team: "enemy" })
	.setModifiers([{ name: "Stagger", stacks: 1 }, { name: "Poison", stacks: 3 }])
	.setCost(350)
	.setUses(5)
	.setCritBonus(2)
	.setDamage(50);

function effect(targets, user, isCrit, adventure) {
	let { element, modifiers: [elementStagger, poison], damage, critBonus } = module.exports;
	if (isCrit) {
		damage *= critBonus;
	}
	return targets.map(target => {
		if (target.hp < 1) {
			return "";
		}

		if (user.element === element) {
			addModifier(target, elementStagger);
		}
		addModifier(target, poison);
		return dealDamage(target, user, damage, false, element, adventure);
	}).filter(result => Boolean(result)).join(" ");
}
