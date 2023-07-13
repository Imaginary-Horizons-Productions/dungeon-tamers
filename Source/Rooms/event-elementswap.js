const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const RoomTemplate = require("../../Classes/RoomTemplate.js")

module.exports = new RoomTemplate("Elemental Research", [
]).setDescription("An imp wearing glasses approaches you with a contract. If you allow your element to be changed to @{roomElement}, you'll be compensated.")
	.setElement("@{adventureWeakness}");

module.exports.uiRows.push(new ActionRowBuilder().addComponents(
	new ButtonBuilder().setCustomId("elementswap")
		.setLabel("Sign the contract [+200g, change element]")
		.setStyle(ButtonStyle.Primary)
))
