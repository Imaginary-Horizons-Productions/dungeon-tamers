const { MessageActionRow, MessageButton } = require("discord.js");
const Room = require("../../Classes/Room.js")

module.exports = new Room()
	.setType("event")
	.setTitle("Abandoned Forge")
	.setDescription("The room contains an abandoned forge. There seem to be enough supplies leftover to upgrade 1 weapon.");

module.exports.components.push(new MessageActionRow().addComponents(
	new MessageButton()
		.setCustomId("upgrade")
		.setLabel("Pick a weapon to randomly upgrade")
		.setStyle("SUCCESS"),
	new MessageButton()
		.setCustomId("continue")
		.setLabel("Move on")
		.setStyle("SECONDARY")
))

module.exports.lootList = { "randomUpgrade": "n" };