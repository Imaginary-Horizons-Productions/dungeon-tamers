const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const Adventure = require('../../Classes/Adventure.js');
const Command = require('../../Classes/Command.js');
const Delver = require('../../Classes/Delver.js');
const { ELEMENTS, generateRandomNumber } = require('../../helpers.js');
const { setAdventure } = require("../adventureDAO.js");
const { getGuild } = require('../guildDAO.js');

module.exports = new Command("delve", "Start a new adventure", false, false);
module.exports.data.addStringOption(option => option.setName("seed").setDescription("The value to base the random events of the run on").setRequired(false));

let DESCRIPTORS = ["Shining", "New", "Dusty", "Old", "Floating", "Undersea", "Future", "Intense"];
let LOCATIONS = ["Adventure", "Castle", "Labyrinth", "Ruins", "Plateau", "Dungeon", "Maze", "Fortress", "Dream"];
let ELEMENT_COLORS = ["RED", "ORANGE", "YELLOW", "BLUE", "GREEN", "PURPLE"];

module.exports.execute = (interaction) => {
	// Start a new adventure
	let guildProfile = getGuild(interaction.guild.id);
	if (interaction.channel.id === guildProfile.centralId) {
		let adventure = new Adventure(interaction.options.getString("seed")).generateRNTable();

		//TODO #77 roll bosses
		adventure.finalBoss = "Hall of Mirrors";
		adventure.bosses = [];

		let elementIndex = generateRandomNumber(adventure, ELEMENTS.length, "general");
		adventure.setName(`${DESCRIPTORS[generateRandomNumber(adventure, DESCRIPTORS.length, "general")]} ${LOCATIONS[generateRandomNumber(adventure, LOCATIONS.length, "general")]} of ${ELEMENTS[elementIndex]}`)
			.setElement(ELEMENTS[elementIndex]);
		interaction.guild.channels.fetch(guildProfile.categoryId).then(category => {
			interaction.guild.channels.create(adventure.name, {
				parent: category,
				permissionOverwrites: [
					{
						id: interaction.client.user.id,
						type: 1,
						allow: ["VIEW_CHANNEL"]
					},
					{
						id: interaction.user.id,
						type: 1,
						allow: ["VIEW_CHANNEL"]
					},
					{
						id: interaction.guild.id,
						type: 0,
						deny: ["VIEW_CHANNEL"]
					} //TODO #16 allow view channel for moderators
				]
			}).then(channel => {
				adventure.delvers.push(new Delver(interaction.user.id, interaction.member.displayName, channel.id));
				let embed = new MessageEmbed().setColor(ELEMENT_COLORS[elementIndex])
					.setTitle(adventure.name)
					.setDescription("A new adventure is starting!")
					.addField("1 Party Member", `Leader: ${interaction.member}`)
					.setFooter("Imaginary Horizons Productions", "https://cdn.discordapp.com/icons/353575133157392385/c78041f52e8d6af98fb16b8eb55b849a.png")
				let join = new MessageActionRow().addComponents(
					new MessageButton().setCustomId(`join-${channel.id}`)
						.setLabel("Join")
						.setStyle("PRIMARY")
				)
				interaction.reply({ embeds: [embed], components: [join], fetchReply: true }).then(recruitMessage => {
					let ready = new MessageActionRow().addComponents(
						new MessageButton().setCustomId("deploy")
							.setLabel("Pick an Archetype")
							.setStyle("PRIMARY"),
						new MessageButton().setCustomId("difficulty")
							.setLabel("Vote on Difficulty Options (coming soon)")
							.setStyle("DANGER")
							.setDisabled(true)
					)
					channel.send({ content: "The adventure will begin when everyone has picked an archetype and the leader clicks the \"Ready!\" button.", components: [ready] }).then(message => {
						channel.send(`${interaction.user} Here's the channel for your new adventure. As adventure leader your vote will be the tie breaker!`);
						adventure.setId(channel.id)
							.setMessageId("recruit", recruitMessage.id)
							.setMessageId("deploy", message.id)
							.setLeaderId(interaction.user.id);
						setAdventure(adventure);
					});
				}).catch(console.error);
			})
		})
	} else {
		interaction.reply({ content: `Please start your delves from <#${guildProfile.centralId}>.`, ephemeral: true })
			.catch(console.error);
	}
}
