const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const { addModifier, removeModifier } = require('../combatantDAO.js');

module.exports = new EquipmentTemplate("Vigilance Charm", "Gain @{mod1Stacks} @{mod1}", "@{mod1} +@{bonus}", "Earth", effect)
	.setCategory("Trinket")
	.setTargetingTags({ target: "self", team: "self" })
	.setUpgrades("Long Vigilance Charm", "Devoted Vigilance Charm", "Guarding Vigilance Charm")
	.setModifiers([{ name: "Stagger", stacks: 1 }, { name: "Vigilance", stacks: 3 }])
	.setBonus(2) // Vigilance stacks
	.setCost(200)
	.setUses(15);

function effect(targets, user, isCrit, adventure) {
	let { element, modifiers: [elementStagger, vigilance], bonus } = module.exports;
	const pendingVigilance = { ...vigilance, stacks: vigilance.stacks + (isCrit ? bonus : 0) };
	if (user.element === element) {
		removeModifier(user, elementStagger);
	}
	addModifier(user, pendingVigilance);
	return `${user.getName(adventure.room.enemyIdMap)} gains Vigilance.`;
}
