// Represents a player's information specific to a specific delve including: delve id, difficulty options, character selected, stats, weapons and upgrades, and artifacts
module.exports = class Delver {
	constructor(idInput, adventureIdInput) {
		this.id = idInput;
		this.adventureId = adventureIdInput;
		this.difficultyOptions = [];
		this.name = "Placeholder";
		this.hp = 10;
		this.maxHp = 30;
		this.readType = "targets";
		this.weapons = [];
	}
}
