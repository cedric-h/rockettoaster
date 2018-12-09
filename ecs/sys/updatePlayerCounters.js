const broadcast = require('../../helper/broadcast.js');

entities.emitter.on('teamCreate', entity => {
	setImmediate(() => broadcast(
		'changeTeamCounter', 
		{
			team: entities.getComponent(entity, "team"),
			change: 1
		}
	));
});

entities.emitter.on('teamRemove', entity => {
	broadcast(
		'changeTeamCounter',
		{
			team: entities.getComponent(entity, "team"),
			change: -1
		}
	);
});

entities.emitter.on('playerInMenu', entity => {
	let client = entities.getComponent(entity, "client");

	let teamsData = {
		lime: 0,
		cyan: 0
	};

	entities.find('team').forEach(entity => {
		let team = entities.getComponent(entity, "team");
		teamsData[team]++;
	});

	client.send("playersInGameData", teamsData);
});

module.exports = {
};
