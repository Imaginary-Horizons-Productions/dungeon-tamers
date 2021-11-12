var enemyWhitelist = [
	"clone.js",
	"hawk.js",
	"ooze.js",
	"slime.js"
];

const enemyDictionary = {};

for (const file of enemyWhitelist) {
	const enemy = require(`./${file}`);
	enemyDictionary[enemy.name] = enemy;
}

exports.getEnemy = function (enemyName) {
	return enemyDictionary[enemyName];
}
