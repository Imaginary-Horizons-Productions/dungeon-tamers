const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const { dealDamage, addModifier } = require("../combatantDAO.js");
const { needsLivingTargets } = require('../enemyDAO.js');

module.exports = new EquipmentTemplate("Toxic Shortsword", "Strike a foe for @{damage} @{element} damage, then apply @{mod1Stacks} @{mod1} and @{mod2Stacks} @{mod2} to the foe and @{mod1Stacks} @{mod1} to yourself", "Damage x@{critBonus}", "Fire", needsLivingTargets(effect))
	.setCategory("Weapon")
	.setTargetingTags({ target: "single", team: "enemy" })
	.setSidegrades("Accelerating Shortsword")
	.setModifiers([{ name: "Stagger", stacks: 1 }, { name: "Exposed", stacks: 1 }, { name: "Poison", stacks: 3 }])
	.setCost(350)
	.setUses(15)
	.setDamage(75);

function effect([target], user, isCrit, adventure) {
	let { element, modifiers: [elementStagger, exposed, poison], damage, critBonus } = module.exports;
	if (user.element === element) {
		addModifier(target, elementStagger);
	}
	if (isCrit) {
		damage *= critBonus;
	}
	addModifier(user, exposed);
	addModifier(target, poison);
	return dealDamage([target], user, damage, false, element, adventure).then(damageText => {
		addModifier(target, exposed);
		return `${damageText} ${target.getName(adventure.room.enemyIdMap)} is Poisoned. ${user.getName(adventure.room.enemyIdMap)} is Exposed.`;
	});
}
