const p2 = require('../../p2.min.js');

function angleLerp(a, b, t) {
	shortest_angle = ((((b - a) % (Math.PI*2)) + (Math.PI*3)) % (Math.PI*2)) - Math.PI;
    return shortest_angle * t;
}

let serverPositions = {};

entities.emitter.on('loaded', () => {

	entities.emitter.on('bodyCreate', entity => {
		serverPositions[entity] = {};
	});

	//physics comes with a megapacket which contains
	//orientation/velocity data for all physics objects.
	server.on('physics', megapacket => {

		//loop over all entities with serverIds, and update their info if there is any.
		entities.find('serverId').forEach(entity => {

			let id = entities.getComponent(entity, "serverId");

			if(megapacket[id]) {
				let body = entities.getComponent(entity, "body");
				let goal = serverPositions[entity];

				Object.keys(megapacket[id]).forEach(key => {
					
					//so certain values are stored, and then we
					//slide our way over to those,
					if(key === "position" || key === "angle")
						goal[key] = megapacket[id][key];

					//but the rest of the values are just directly applied
					else {
						body[key] = megapacket[id][key];
					}
				});
			}

		});
	});
});

module.exports = {
	componentTypesAffected: ["body", "serverId"],
	searchName: "physicsDataTransmitted", //because physics data is transmitted for this.
	update: (entity, delta) => {
		let body = entities.getComponent(entity, "body");
		let goalBody = serverPositions[entity];

		Object.keys(goalBody).forEach(key => {
			let goalValue = goalBody[key];
			let value = body[key];

			if(key === "position") {
				p2.vec2.lerp(
					value,
					value,
					goalValue,
					delta
				);
			}

			if(key === "angle") {
				value = angleLerp(value, goalValue, delta*2);
			}
		});
	}
};

