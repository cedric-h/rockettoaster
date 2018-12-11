const broadcast = require('../../helper/broadcast.js');

let points = {
	cyan: 0,
	lime: 0
}
//for ignoring points while the game is resetting.
//(a lot of things are destroyed then)
let isResetting = false;

//reset points when game restarts
entities.emitter.on('resetPrepare', () => {
	isResetting = true;
});

entities.emitter.on('resetDone', () => {
	isResetting = false;
	points.cyan = 0;
	points.lime = 0;
});

//someone from a team died or left, let's up the other team's point counter.
entities.emitter.on('teamRemove', addPoint);
entities.emitter.on('playerKilled', addPoint);

function addPoint(entity) {
	if(!isResetting) {
		//grab opposite team
		let earningTeam = (entities.getComponent(entity, "team") === "cyan")
			? "lime"
			: "cyan";

		points[earningTeam]++;

		broadcast('changeTeamPoints', {
			team: earningTeam,
			change: points[earningTeam]
		});

		entities.emitter.emit('pointEarned', points, earningTeam, points[earningTeam]);
	}
}

entities.emitter.on('playerInMenu', entity => {
	let client = entities.getComponent(entity, "client");

	client.send("playersInGameData", points);
});

module.exports = {
};
