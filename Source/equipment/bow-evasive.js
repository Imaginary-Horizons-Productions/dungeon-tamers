const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const { dealDamage, addModifier } = require('../combatantDAO.js');

module.exports = new EquipmentTemplate("Evasive Bow", 2, "*Strike a foe for @{damage} @{element} damage and gain @{mod1Stacks} @{mod1} with priority*\nCritical Hit: Damage x@{critBonus}", "Wind", effect, ["Hunter's Bow", "Mercurial Bow"])
	.setCategory("Weapon")
	.setTargetingTags({ target: "single", team: "enemy" })
	.setModifiers([{ name: "Stagger", stacks: 1 }, { name: "Evade", stacks: 2 }])
	.setCost(350)
	.setUses(10)
	.setDamage(75)
	.markPriority();

function effect(target, user, isCrit, adventure) {
	let { element, modifiers: [elementStagger, evade], damage, critBonus } = module.exports;
	if (user.element === element) {
		addModifier(target, elementStagger);
	}
	if (isCrit) {
		damage *= critBonus;
	}
	addModifier(user, evade);
	return dealDamage(target, user, damage, false, element, adventure);
}
