const EquipmentTemplate = require('../../Classes/EquipmentTemplate.js');
const Resource = require('../../Classes/Resource.js');
const { removeModifier, getFullName } = require('../combatantDAO.js');
const { rollConsumable } = require('../labyrinths/_labyrinthDictionary.js');

module.exports = new EquipmentTemplate("Potion Kit", "Add 1 random potion to loot, regain 1 durability when entering a new room", "Instead add @{critBonus} potions", "Water", effect, ["Guarding Potion Kit", "Urgent Potion Kit"])
.setCategory("Trinket")
.setTargetingTags({ target: "none", team: "none" })
.setModifiers([{ name: "Stagger", stacks: 1 }])
.setCost(350)
.setUses(10);

function effect(targets, user, isCrit, adventure) {
	let { element, modifiers: [elementStagger], critBonus } = module.exports;
	if (user.element === element) {
		removeModifier(user, elementStagger);
	}
	const randomPotion = rollConsumable(adventure, "Potion");
	if (isCrit) {
		adventure.addResource(new Resource(randomPotion, "consumable", critBonus, "loot", 0));
		return `${getFullName(user, adventure.room.enemyTitles)} sets a double-batch of ${randomPotion} simmering.`;
	} else {
		adventure.addResource(new Resource(randomPotion, "consumable", 1, "loot", 0));
		return `${getFullName(user, adventure.room.enemyTitles)} sets a batch of ${randomPotion} simmering.`;
	}
}