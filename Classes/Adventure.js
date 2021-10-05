module.exports = class Adventure {
	constructor(seedInput) {
		this.initialSeed = seedInput || Date.now().toString();
		this.rnTable = linearRandomGenerator(processSeed(this.initialSeed, seedInput !== undefined)).join("");
	}
	id; // the id of the channel created for the adventure
	name;
	rnIndex = 0;
	rnIndexBattle = 0;
	startMessageId = "";
	deployMessageId = "";
	utilityMessageId = "";
	lastComponentMessageId = "";
	leaderId = "";
	delvers = [];
	difficultyOptions = [];
	accumulatedScore = 0;
	depth = 0;
	lives = 2;
	gold = 100;
	battleRound;
	battleEnemies = [];
	battleEnemyTitles = {};
	battleMoves = [];

	setName(nameInput) {
		this.name = nameInput;
		return this;
	}

	setId(textChannelId) {
		this.id = textChannelId;
		return this;
	}

	setStartMessageId(id) {
		this.startMessageId = id;
		return this;
	}

	setDeployMessageId(id) {
		this.deployMessageId = id;
		return this;
	}

	setLeaderId(id) {
		this.leaderId = id;
		return this;
	}
}

function processSeed(initialSeed, seedProvidedByUser) {
	let lumber; // will become a table later
	if (seedProvidedByUser) {
		// Sum the unicode indices of the characters
		lumber = Array.from(initialSeed).reduce((total, current) => total += current.charCodeAt(0), 0).toString();
	} else {
		lumber = initialSeed;
	}
	return lumber.substring(-5); // planks
}

function linearRandomGenerator(seed) {
	const results = [];
	for (let i = 0; i < 10000; i++) {
		seed = (5 * seed + 7) % 100003;
		results.push(seed);
	}
	return results;
}
