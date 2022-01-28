const Button = require('../../Classes/Button.js');
const { ordinalSuffixEN } = require('../../helpers.js');
const { getAdventure, setAdventure, updateRoomHeader, calculateScoutingCost } = require('../adventureDAO.js');
const { editButton } = require("../roomDAO.js");
const { prerollBoss } = require('../Rooms/_roomDictionary.js');

module.exports = new Button("buyscouting");

module.exports.execute = (interaction, [type]) => {
	// Set flags for party scouting and remove gold from party inventory
	let adventure = getAdventure(interaction.channel.id);
	let user = adventure.delvers.find(delver => delver.id == interaction.user.id);
	if (user) {
		const cost = calculateScoutingCost(adventure, type);
		adventure.gold -= cost;
		if (type === "Final Battle") {
			adventure.scouting.finalBoss = true;
			interaction.message.edit({ components: editButton(interaction.message, interaction.customId, true, "✔️", `Final Battle: ${adventure.finalBoss}`) });
			interaction.reply(`The merchant reveals that final battle for this adventure will be **${adventure.finalBoss}** (you can review this with \`/party-stats\`).`);
		} else {
			interaction.message.edit({ components: editButton(interaction.message, interaction.customId, adventure.gold < Number(cost), null, `${cost}g: Scout the ${ordinalSuffixEN(adventure.scouting.artifactGuardians + 2)} Artifact Guardian`) });
			interaction.reply(`The merchant reveals that the ${ordinalSuffixEN(adventure.scouting.artifactGuardians + 1)} artifact guardian for this adventure will be **${adventure.artifactGuardians[adventure.scouting.artifactGuardians]}** (you can review this with \`/party-stats\`).`);
			adventure.scouting.artifactGuardians++;
			while (adventure.artifactGuardians.length <= adventure.scouting.artifactGuardians) {
				prerollBoss("Artifact Guardian", adventure);
			}
		}
		updateRoomHeader(adventure, interaction.message);
		setAdventure(adventure);
	} else {
		interaction.reply({ content: "Plesae buy scouting in adventures you've joined.", ephemeral: true });
	}
}
