const broadcast = require('../../helper/broadcast.js');

entities.emitter.on('pointEarned', (points, team) => {
	console.log('points for this team is ' + points[team]);
	if(points[team] >= 10) {
		entities.emitter.emit('resetPrepare');

		broadcast("teamWon", team);

		//wait a few seconds, then reset map.
		setTimeout(() => {
			entities.emitter.emit('reset');
			entities.emitter.emit('resetDone');
		}, 5 * 1000);
	}
});

module.exports = {
};
