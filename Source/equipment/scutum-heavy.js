const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const { addBlock, removeModifier } = require('../combatantDAO.js');
const { needsLivingTargets } = require('../enemyDAO.js');

module.exports = new EquipmentTemplate("Heavy Scutum", "Grant @{block} block to an ally and yourself", "Block x@{critBonus}", "Fire", needsLivingTargets(effect))
	.setCategory("Armor")
	.setTargetingTags({ target: "single", team: "delver" })
	.setSidegrades("Sweeping Scutum", "Vigilant Scutum")
	.setModifiers([{ name: "Stagger", stacks: 1 }])
	.setCost(350)
	.setUses(15)
	.setBlock(100);

function effect([target], user, isCrit, adventure) {
	let { element, modifiers: [elementStagger], block, critBonus } = module.exports;
	if (user.element === element) {
		removeModifier(target, elementStagger);
	}
	if (isCrit) {
		block *= critBonus;
	}
	addBlock(target, block);
	addBlock(user, block);
	return `Damage will be blocked for ${target.getName(adventure.room.enemyIdMap)} and ${user.getName(adventure.room.enemyIdMap)}.`;
}
