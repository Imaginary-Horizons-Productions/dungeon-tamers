const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const { addModifier, dealDamage, gainHealth } = require('../combatantDAO.js');

module.exports = new EquipmentTemplate("Urgent Life Drain", "*Strike a foe for @{damage} @{element} damage, then gain @{healing} hp with priority*\nCritical Hit💥: Healing x@{critBonus}", "Water", effect, ["Flanking Life Drain", "Reactive Life Drain"])
	.setCategory("Spell")
	.setTargetingTags({ target: "single", team: "enemy" })
	.setModifiers([{ name: "Stagger", stacks: 1 }])
	.setCost(350)
	.setUses(10)
	.setDamage(75)
	.setHealing(25)
	.markPriority();

async function effect(target, user, isCrit, adventure) {
	let { element, modifiers: [elementStagger], damage, healing, critBonus } = module.exports;
	if (user.element === element) {
		addModifier(target, elementStagger);
	}
	if (isCrit) {
		healing *= critBonus;
	}
	return `${await dealDamage(target, user, damage, false, element, adventure)} ${gainHealth(user, healing, adventure)}`;
}
