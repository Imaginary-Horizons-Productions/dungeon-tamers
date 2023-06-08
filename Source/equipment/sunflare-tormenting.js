const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const { addModifier } = require('../combatantDAO.js');
const { isDebuff } = require('../Modifiers/_modifierDictionary.js');

module.exports = new EquipmentTemplate("Tormenting Sun Flare", "Inflict @{mod1Stacks} @{mod1} and duplicate its debuffs with priority", "Also inflict @{mod2Stacks} @{mod2}", "Wind", effect, ["Accelerating Sun Flare", "Evasive Sun Flare"])
	.setCategory("Spell")
	.setTargetingTags({ target: "single", team: "enemy" })
	.setModifiers([{ name: "Stagger", stacks: 1 }, { name: "Stagger", stacks: 1 }, { name: "Slow", stacks: 2 }])
	.setCost(350)
	.setUses(10)
	.markPriority();

function effect([target], user, isCrit, adventure) {
	if (target.hp < 1) {
		return ` ${target.getName(adventure.room.enemyIdMap)} was already dead!`;
	}

	let { element, modifiers: [elementStagger, stagger, slow] } = module.exports;
	for (const modifier in target.modifiers) {
		if (isDebuff(modifier)) {
			addModifier(target, { name: modifier, stacks: 1 });
		}
	}
	if (user.element === element) {
		addModifier(target, elementStagger);
	}
	if (isCrit) {
		addModifier(target, slow);
	}
	addModifier(target, stagger);
	return "";
}
