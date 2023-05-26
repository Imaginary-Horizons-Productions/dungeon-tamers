const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const { dealDamage, addModifier, addBlock, getFullName } = require('../combatantDAO.js');

module.exports = new EquipmentTemplate("Guarding Lance", "Strike a foe for @{damage} @{element} damage, then gain @{block} block and @{mod1Stacks} @{mod1}", "Damage x@{critBonus}", "Earth", effect, ["Reckless Lance", "Slowing Lance"])
	.setCategory("Weapon")
	.setTargetingTags({ target: "single", team: "enemy" })
	.setModifiers([{ name: "Stagger", stacks: 1 }, { name: "Power Up", stacks: 25 }])
	.setCost(350)
	.setUses(10)
	.setDamage(75)
	.setBlock(75);

function effect([target], user, isCrit, adventure) {
	if (target.hp < 1) {
		return ` ${getFullName(target, adventure.room.enemyTitles)} was already dead!`;
	}

	let { element, modifiers: [elementStagger, powerUp], damage, block, critBonus } = module.exports;
	if (user.element === element) {
		addModifier(target, elementStagger);
	}
	if (isCrit) {
		damage *= critBonus;
	}
	addBlock(user, block);
	addModifier(user, powerUp);
	return dealDamage(target, user, damage, false, element, adventure);
}