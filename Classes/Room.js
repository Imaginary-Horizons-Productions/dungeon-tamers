// Read and write object represeting a room in an adventure
module.exports = class Room {
	constructor(titleInput) {
		this.title = titleInput;
		this.loot = { "gold": 0 };
	}
}
