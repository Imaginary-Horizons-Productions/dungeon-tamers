const Button = require('../../Classes/Button.js');
const Delver = require('../../Classes/Delver.js');
const { getAdventure, setAdventure } = require("./../adventureDAO.js").injectConfig(true);

module.exports = new Button("join");

module.exports.execute = (interaction, [guildId, adventureId]) => {
	// Join an existing adventure
	let adventure = getAdventure(adventureId);
	if (adventure.state === "config") {
		if (adventure.delvers.length < 12) {
			if (!adventure.delvers.some(delver => delver.id == interaction.user.id)) {
				// Update game logic
				adventure.delvers.push(new Delver(interaction.user.id, interaction.member.displayName, adventureId));
				adventure.lives++;
				adventure.gainGold(50);
				setAdventure(adventure);

				// Welcome player to thread
				let thread = interaction.client.guilds.resolve(guildId).channels.resolve(adventureId);
				thread.send(`${interaction.member} joined the adventure.`).then(_message => {
					if (adventure.messageIds.start) {
						thread.messages.delete(adventure.messageIds.start);
						adventure.messageIds.start = "";
					}
				});

				// Update recruit message
				let partyList = `Leader: <@${adventure.leaderId}>`;
				for (let delver of adventure.delvers) {
					if (delver.id !== adventure.leaderId) {
						partyList += `\n<@${delver.id}>`;
					}
				}
				let embeds = [];
				if (interaction.message.embeds[0]) {
					embeds = [interaction.message.embeds[0].spliceFields(0, 1, { name: `${adventure.delvers.length} Party Member${adventure.delvers.length == 1 ? "" : "s"}`, value: partyList })];
				}
				let components = interaction.message.components;
				if (adventure.delvers.length > 11) {
					components = [];
				}
				interaction.update({ embeds, components });
			} else {
				interaction.reply({ content: "You are already part of this adventure!", ephemeral: true })
					.catch(console.error);
			}
		} else {
			interaction.message.edit({ components: [] });
			interaction.reply({ content: "Due to UI limitations, maximum number of delvers on an adventure is 12.", ephemeral: true });
		}
	} else {
		interaction.reply({ content: "This adventure has already started, but you can recruit for your own with `/delve`.", ephemeral: true });
	}
}
