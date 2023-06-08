const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const { addModifier } = require('../combatantDAO.js');

module.exports = new EquipmentTemplate("Corrosion", "Inflict @{mod1Stacks} @{mod1} on a foe", "Also inflict @{mod2Stacks} @{mod2}", "Fire", effect, ["Flanking Corrosion"])
	.setCategory("Spell")
	.setTargetingTags({ target: "single", team: "enemy" })
	.setModifiers([{ name: "Stagger", stacks: 1 }, { name: "Power Down", stacks: 40 }, { name: "Stagger", stacks: 1 }])
	.setCost(200)
	.setUses(10);

function effect([target], user, isCrit, adventure) {
	if (target.hp < 1) {
		return ` ${target.getName(adventure.room.enemyIdMap)} was already dead!`;
	}

	let { element, modifiers: [elementStagger, powerDown, critStagger] } = module.exports;
	if (user.element === element) {
		addModifier(target, elementStagger);
	}
	if (isCrit) {
		addModifier(target, critStagger);
	}
	addModifier(target, powerDown);
	return ""; // result text
}
