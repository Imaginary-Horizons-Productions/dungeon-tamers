const { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ThreadChannel, EmbedBuilder, ButtonStyle, ComponentType } = require("discord.js");
const { Adventure } = require("../Classes/Adventure.js");

const { SAFE_DELIMITER, MAX_MESSAGE_ACTION_ROWS } = require("../constants.js");
const { ordinalSuffixEN } = require("../helpers");

const { getArtifact } = require("./Artifacts/_artifactDictionary");
const { getChallenge } = require("./Challenges/_challengeDictionary.js");
const { getConsumable } = require("./consumables/_consumablesDictionary.js");
const { getColor } = require("./elementHelpers.js");
const { buildEquipmentDescription, getEquipmentProperty } = require("./equipment/_equipmentDictionary");
const { getLabyrinthProperty } = require("./labyrinths/_labyrinthDictionary.js");
const { getRoom } = require("./Rooms/_roomDictionary.js");

/** Derive the embeds and components that correspond with the adventure's state
 * @param {Adventure} adventure
 * @param {ThreadChannel} thread
 * @param {string} descriptionOverride
 */
exports.renderRoom = function (adventure, thread, descriptionOverride) {
	const roomTemplate = getRoom(adventure.room.title);
	const { hasEnemies } = adventure.room;
	const isCombatVictory = adventure.room.enemies?.every(enemy => enemy.hp === 0);

	const roomEmbed = new EmbedBuilder().setColor(getColor(adventure.room.element))
		.setAuthor({ name: roomHeaderString(adventure), iconURL: thread.client.user.displayAvatarURL() })
		.setTitle(`${adventure.room.title}${isCombatVictory ? " - Victory!" : ""}`)
		.setFooter({ text: `Room #${adventure.depth}${hasEnemies ? ` - Round ${adventure.room.round}` : ""}` });

	if (descriptionOverride || roomTemplate) {
		roomEmbed.setDescription(descriptionOverride || roomTemplate.description.replace("@{roomElement}", adventure.room.element));
	}
	let components = [];

	if (adventure.depth <= getLabyrinthProperty(adventure.labyrinth, "maxDepth")) {
		if (adventure.state !== "completed") {
			// Continue
			if ("roomAction" in adventure.room.resources) {
				roomEmbed.addFields({ name: "Room Actions", value: adventure.room.resources.roomAction.count.toString() });
			}

			if (roomTemplate) {
				components.push(...roomTemplate.uiRows);
			}
			if (adventure.room.title === "Treasure!") {
				components.push(generateTreasureRow(adventure));
			}
			components.push(...generateMerchantRows(adventure));

			components = components.slice(0, MAX_MESSAGE_ACTION_ROWS - 2);
			if (hasEnemies && !isCombatVictory) {
				components.push(new ActionRowBuilder().addComponents(
					new ButtonBuilder().setCustomId("inspectself")
						.setLabel("Inspect Self")
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder().setCustomId("predict")
						.setEmoji("🔮")
						.setLabel("Predict")
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder().setCustomId("readymove")
						.setLabel("Ready a Move")
						.setStyle(ButtonStyle.Primary),
					new ButtonBuilder().setCustomId("readyconsumable")
						.setLabel("Ready a Consumable")
						.setStyle(ButtonStyle.Primary)
						.setDisabled(!Object.values(adventure.consumables).some(quantity => quantity > 0))
				));
			} else {
				if (isCombatVictory) {
					components.push(generateLootRow(adventure));
				}
				roomEmbed.addFields({ name: "Decide the next room", value: "Each delver can pick or change their pick for the next room. The party will move on when the decision is unanimous." });
				components.push(generateRoutingRow(adventure));
			}
		} else {
			// Defeat
			addScoreField(roomEmbed, adventure);
			components = [];

		}
	} else {
		// Victory
		addScoreField(roomEmbed, adventure);
		components = [new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId("viewcollectartifact")
				.setLabel("Collect Artifact")
				.setStyle(ButtonStyle.Success)
		)];
	}
	return {
		embeds: [roomEmbed],
		components
	}
}

/** The score breakdown is added to a room embed to show how the players in the just finished adventure did
 * @param {MessageEmbed} embed
 * @param {Adventure} adventure
 */
function addScoreField(embed, adventure) {
	const isSuccess = adventure.lives > 0 && adventure.depth > getLabyrinthProperty(adventure.labyrinth, "maxDepth");
	const livesScore = adventure.lives * 10;
	const goldScore = Math.floor(Math.log10(adventure.peakGold)) * 5;
	let score = adventure.accumulatedScore + livesScore + goldScore + adventure.depth;
	let challengeMultiplier = 1;
	Object.keys(adventure.challenges).forEach(challengeName => {
		const challenge = getChallenge(challengeName);
		challengeMultiplier *= challenge.scoreMultiplier;
	})
	score *= challengeMultiplier;
	if (!isSuccess) {
		embed.setTitle(`Defeated${adventure.room.title ? ` in ${adventure.room.title}` : " before even starting"}`);
		score = Math.floor(score / 2);
	} else {
		embed.setTitle(`Success in ${adventure.labyrinth}`);
	}
	const skippedArtifactsMultiplier = 1 + (adventure.delvers.reduce((count, delver) => delver.startingArtifact ? count : count + 1, 0) / adventure.delvers.length);
	score = Math.max(1, score * skippedArtifactsMultiplier);
	const depthScoreLine = generateScoreline("additive", "Depth", adventure.depth);
	const livesScoreLine = generateScoreline("additive", "Lives", livesScore);
	const goldScoreline = generateScoreline("additive", "Gold", goldScore);
	const bonusScoreline = generateScoreline("additive", "Bonus", adventure.accumulatedScore);
	const challengesScoreline = generateScoreline("multiplicative", "Challenges Multiplier", challengeMultiplier);
	const skippedArtifactScoreline = generateScoreline("multiplicative", "Artifact Skip Multiplier", skippedArtifactsMultiplier);
	const defeatScoreline = generateScoreline("multiplicative", "Defeat", isSuccess ? 1 : 0.5);
	embed.addFields({ name: "Score Breakdown", value: `${depthScoreLine}${livesScoreLine}${goldScoreline}${bonusScoreline}${challengesScoreline}${skippedArtifactScoreline}${defeatScoreline}\n__Total__: ${score}` });
	adventure.accumulatedScore = score;
}

/** Generates the string for a scoreline or omits the line (returns empty string) if value is the identity for stackType
 * @param {"additive" | "multiplicative"} stackType
 * @param {string} label
 * @param {number} value
 */
function generateScoreline(stackType, label, value) {
	switch (stackType) {
		case "additive":
			if (value !== 0) {
				return `${label}: ${value.toString()}\n`;
			}
			break;
		case "multiplicative":
			if (value !== 1) {
				return `${label}: x${value.toString()}\n`;
			}
			break;
		default:
			console.error(new Error(`Generating scoreline with unregistered stackType: ${stackType}`));
	}
	return "";
}

/** A room embed's author field contains the most important or commonly viewed party resources and stats
 * @param {Adventure} adventure
 * @returns {string} text to put in the author name field of a room embed
 */
function roomHeaderString({ lives, gold, accumulatedScore }) {
	return `Lives: ${lives} - Party Gold: ${gold} - Score: ${accumulatedScore}`;
}

/** The room header goes in the embed's author field and should contain information about the party's commonly used or important resources
 * @param {Adventure} adventure
 * @param {Message} message
 */
exports.updateRoomHeader = function (adventure, message) {
	message.edit({ embeds: message.embeds.map(embed => new EmbedBuilder(embed).setAuthor({ name: roomHeaderString(adventure), iconURL: message.client.user.displayAvatarURL() })) })
}

function generateRoutingRow(adventure) {
	const candidateKeys = Object.keys(adventure.roomCandidates);
	if (candidateKeys.length > 1) {
		return new ActionRowBuilder().addComponents(
			...candidateKeys.map(candidateTag => {
				const [roomType, depth] = candidateTag.split(SAFE_DELIMITER);
				return new ButtonBuilder().setCustomId(`routevote${SAFE_DELIMITER}${candidateTag}`)
					.setLabel(`Next room: ${roomType}`)
					.setStyle(ButtonStyle.Secondary)
			}));
	} else {
		return new ActionRowBuilder().addComponents(
			new ButtonBuilder().setCustomId("continue")
				.setEmoji("👑")
				.setLabel(`Continue to the ${candidateKeys[0].split(SAFE_DELIMITER)[0]}`)
				.setStyle(ButtonStyle.Secondary)
		);
	}
}

function generateLootRow(adventure) {
	let options = [];
	for (const { name, resourceType: type, count, visibility } of Object.values(adventure.room.resources)) {
		if (visibility === "loot") {
			if (count > 0) {
				let option = { value: `${name}${SAFE_DELIMITER}${options.length}` };

				if (name == "gold") {
					option.label = `${count} Gold`;
				} else {
					option.label = `${name} x ${count}`;
				}

				if (type === "equipment") {
					option.description = buildEquipmentDescription(name, false);
				} else if (type === "artifact") {
					option.description = getArtifact(name).dynamicDescription(count);
				}
				options.push(option)
			}
		}
	}
	if (options.length > 0) {
		return new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder().setCustomId("loot")
				.setPlaceholder("Take some of the spoils of combat...")
				.setOptions(options))
	} else {
		return new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder().setCustomId("loot")
				.setPlaceholder("No loot")
				.setOptions([{ label: "If the menu is stuck, close and reopen the thread.", description: "This usually happens when two players try to take the last thing at the same time.", value: "placeholder" }])
				.setDisabled(true)
		)
	}
}

function generateTreasureRow(adventure) {
	let options = [];
	for (const { name, resourceType: type, count, visibility } of Object.values(adventure.room.resources)) {
		if (visibility === "internal" && type !== "roomAction") {
			if (count > 0) {
				let option = { value: `${name}${SAFE_DELIMITER}${options.length}` };

				if (name === "gold") {
					option.label = `${count} Gold`;
				} else {
					option.label = `${name} x ${count}`;
				}

				switch (type) {
					case "equipment":
						option.description = buildEquipmentDescription(name, false);
						break;
					case "artifact":
						option.description = getArtifact(name).dynamicDescription(count);
						break;
					case "consumable":
						option.description = getConsumable(name).description;
						break;
				}
				options.push(option)
			}
		}
	}
	if (options.length > 0) {
		return new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder().setCustomId("treasure")
				.setPlaceholder("Pick 1 treasure to take...")
				.setOptions(options))
	} else {
		return new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder().setCustomId("treasure")
				.setPlaceholder("No treasure")
				.setOptions([{ label: "If the menu is stuck, close and reopen the thread.", description: "This usually happens when two players try to take the last thing at the same time.", value: "placeholder" }])
				.setDisabled(true)
		)
	}
}

function generateMerchantRows(adventure) {
	let categorizedResources = {};
	for (const { name, visibility, uiGroup } of Object.values(adventure.room.resources)) {
		if (visibility === "always") {
			if (categorizedResources[uiGroup]) {
				categorizedResources[uiGroup].push(name);
			} else {
				categorizedResources[uiGroup] = [name];
			}
		}
	}

	let rows = [];
	for (const groupName in categorizedResources) {
		if (groupName.startsWith("equipment")) {
			const [type, tier] = groupName.split(SAFE_DELIMITER);
			let options = [];
			categorizedResources[groupName].forEach((resource, i) => {
				if (adventure.room.resources[resource].count > 0) {
					const cost = getEquipmentProperty(resource, "cost");
					options.push({
						label: `${cost}g: ${resource}`,
						description: buildEquipmentDescription(resource, false),
						value: `${resource}${SAFE_DELIMITER}${i}`
					})
				}
			})
			if (options.length) {
				rows.push(new ActionRowBuilder().addComponents(
					new StringSelectMenuBuilder().setCustomId(`buy${groupName}`)
						.setPlaceholder(`Check a ${tier === "Rare" ? "rare " : ""}piece of equipment...`)
						.setOptions(options)));
			} else {
				rows.push(new ActionRowBuilder().addComponents(
					new StringSelectMenuBuilder().setCustomId(`buy${groupName}`)
						.setPlaceholder("SOLD OUT")
						.setOptions([{ label: "If the menu is stuck, close and reopen the thread.", description: "This usually happens when two players try to buy the last item at the same time.", value: "placeholder" }])
						.setDisabled(true)));
			}
		} else if (groupName === "scouting") {
			const bossScoutingCost = adventure.room.resources.bossScouting.cost;
			const guardScoutingCost = adventure.room.resources.guardScouting.cost;
			rows.push(new ActionRowBuilder().addComponents(
				new ButtonBuilder().setCustomId(`buyscouting${SAFE_DELIMITER}Final Battle`)
					.setLabel(`${adventure.scouting.finalBoss ? `Final Battle: ${adventure.finalBoss}` : `${bossScoutingCost}g: Scout the Final Battle`}`)
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(adventure.scouting.finalBoss || adventure.gold < bossScoutingCost),
				new ButtonBuilder().setCustomId(`buyscouting${SAFE_DELIMITER}Artifact Guardian`)
					.setLabel(`${guardScoutingCost}g: Scout the ${ordinalSuffixEN(adventure.scouting.artifactGuardians + 1)} Artifact Guardian`)
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(adventure.gold < guardScoutingCost)
			));
		}
	}
	return rows;
}

/** Modify the buttons whose `customId`s are keys in `edits` from among `components` based on `preventUse`, `label`, and `emoji` then return all components
 * @param {MessageActionRow[]} components
 * @param {{[customId: string]: {preventUse: boolean; label: string; emoji?: string}}} edits
 * @returns {MessageActionRow[]} the components of the message with the button edited
 */
exports.editButtons = function (components, edits) {
	return components.map(row => {
		return new ActionRowBuilder().addComponents(row.components.map(({ data: component }) => {
			const customId = component.custom_id;
			switch (component.type) {
				case ComponentType.Button:
					const editedButton = new ButtonBuilder(component);
					if (customId in edits) {
						const { preventUse, label, emoji } = edits[customId];
						editedButton.setDisabled(preventUse)
							.setLabel(label);
						if (emoji) {
							editedButton.setEmoji(emoji);
						}
					};
					return editedButton;
				case ComponentType.StringSelect:
					return new StringSelectMenuBuilder(component);
				default:
					throw new Error(`Disabling unregistered component from editButtons: ${component.type}`);

			}
		}));
	})
}

/** Update the room action resource's count and edit the room embeds to show remaining room action
 * @param {Adventure} adventure
 * @param {MessageEmbed[]} embeds
 * @param {number} actionsConsumed
 * @returns {{embeds: MessageEmbed[], remainingActions: number}}
 */
exports.consumeRoomActions = function (adventure, embeds, actionsConsumed) {
	adventure.room.resources.roomAction.count -= actionsConsumed;
	const remainingActions = adventure.room.resources.roomAction.count;
	return {
		embeds: embeds.map(({ data: embed }) => {
			const updatedEmbed = new EmbedBuilder(embed);
			const roomActionsFieldIndex = embed.fields.findIndex(field => field.name === "Room Actions");
			if (roomActionsFieldIndex !== -1) {
				return updatedEmbed.spliceFields(roomActionsFieldIndex, 1, { name: "Room Actions", value: remainingActions.toString() });
			} else {
				return updatedEmbed;
			}
		}),
		remainingActions
	}
}
