const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const { dealDamage, addModifier } = require('../combatantDAO.js');
const { needsLivingTargets } = require('../enemyDAO.js');

module.exports = new EquipmentTemplate("Tormenting Censer", "Burn a foe for @{damage} (+@{bonus} if target has debuffs) @{element} damage, duplicate its debuffs", "Also apply @{mod1Stacks} @{mod1}", "Fire", needsLivingTargets(effect))
	.setCategory("Trinket")
	.setTargetingTags({ target: "single", team: "enemy" })
	.setSidegrades("Fate Sealing Censer", "Thick Censer")
	.setModifiers([{ name: "Stagger", stacks: 1 }, { name: "Slow", stacks: 2 }])
	.setDamage(50)
	.setBonus(75) // damage
	.setCost(350)
	.setUses(15);

function effect([target], user, isCrit, adventure) {
	let { element, modifiers: [elementStagger, slow], damage, bonus } = module.exports;
	for (const modifier in target.modifiers) {
		if (isDebuff(modifier)) {
			addModifier(target, { name: modifier, stacks: 1 });
		}
	}
	if (user.element === element) {
		addModifier(target, elementStagger);
	}
	if (Object.keys(target.modifiers).some(modifier => isDebuff(modifier))) {
		damage += bonus;
	}
	return dealDamage([target], user, damage, false, element, adventure).then(damageText => {
		if (isCrit && target.hp > 0) {
			addModifier(target, slow);
			return `${damageText} ${target.getName(adventure.room.enemyIdMap)} is Slowed and their other debuffs are duplicated.`;
		} else {
			return `${damageText} ${target.getName(adventure.room.enemyIdMap)}'s debuffs are duplicated.`;
		}
	});
}
