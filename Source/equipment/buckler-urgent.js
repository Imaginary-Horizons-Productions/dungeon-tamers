const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const { addBlock, removeModifier } = require('../combatantDAO.js');

module.exports = new EquipmentTemplate("Urgent Buckler", 2, "*Grant an ally @{block} block with priority*\nCritical Hit: Block x@{critBonus}", "Earth", effect, ["Guarding Buckler", "Heavy Buckler"])
	.setCategory("Armor")
	.setTargetingTags({ target: "single", team: "delver" })
	.setModifiers([{ name: "Stagger", stacks: 1 }])
	.setCost(350)
	.setUses(10)
	.setBlock(75)
	.markPriority();

function effect(target, user, isCrit, adventure) {
	let { element, modifiers: [elementStagger], block, critBonus } = module.exports;
	if (user.element === element) {
		removeModifier(target, elementStagger);
	}
	if (isCrit) {
		block *= critBonus;
	}
	addBlock(target, block);
	return "";
}
