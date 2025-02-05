const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const { addModifier, removeModifier, addBlock } = require('../combatantDAO.js');
const { needsLivingTargets } = require('../enemyDAO.js');

module.exports = new EquipmentTemplate("Reinforcing Inspiration", "Apply @{mod1Stacks} @{mod1} and @{block} block to an ally", "@{mod1} +@{bonus}", "Wind", needsLivingTargets(effect))
	.setCategory("Spell")
	.setTargetingTags({ target: "single", team: "delver" })
	.setSidegrades("Soothing Inspiration", "Sweeping Inspiration")
	.setModifiers([{ name: "Stagger", stacks: 1 }, { name: "Power Up", stacks: 25 }])
	.setBonus(25) // Power Up stacks
	.setBlock(25)
	.setCost(350)
	.setUses(10);

function effect([target], user, isCrit, adventure) {
	let { element, modifiers: [elementStagger, powerUp], bonus, block } = module.exports;
	const pendingPowerUp = { ...powerUp, stacks: powerUp.stacks + (isCrit ? bonus : 0) };
	if (user.element === element) {
		removeModifier(target, elementStagger);
	}
	addModifier(target, pendingPowerUp);
	addBlock(target, block);
	return `${target.getName(adventure.room.enemyIdMap)} is Powered Up and prepared to Block.`;
}
