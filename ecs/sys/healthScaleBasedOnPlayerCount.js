
function scaleHealth(entity) {
	if(entities.getComponent(entity, "client") !== undefined) {
		let teamers = entities.find('team').map(entity =>
			entities.getComponent(entity, "team")
		);

		let playerCounts = {};

		teamers.forEach(team => 
			playerCounts[team] = playerCounts[team] === undefined ? 1 : playerCounts[team] + 1
		);

		entities.find('team').forEach(entity => {
			let team = entities.getComponent(entity, "team");
			let playersOnYourTeam = playerCounts[team];
			let playersOnTheirTeam = playerCounts[
				team === "cyan" ? "lime" : "cyan"
			];

			entities.setComponent(
				entity,
				"health",
				(playersOnYourTeam < playersOnTheirTeam)
					? (5*playersOnTheirTeam / playersOnYourTeam)
					: 5
			);
			console.log('new player health is ' + entities.getComponent(entity, "health"));
		});
	}
}

entities.emitter.on('healthCreate', scaleHealth);

entities.emitter.on('playerKilled', scaleHealth);

module.exports = {};
