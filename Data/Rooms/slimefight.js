const Room = require("../../Classes/Room.js");

module.exports = new Room()
	.setType("battle")
	.setTitle("Slime Fight")
	.setDescription("Some slimes and oozes approach...")
	.addEnemy("@{adventure} Slime", "n")
	.addEnemy("@{adventureReverse} Ooze", "n");