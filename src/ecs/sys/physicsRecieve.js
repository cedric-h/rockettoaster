const p2 = require('../../p2.min.js');
const {chunkSize} = require('../../gamedata/constants/worldConfig.json');

//a dictionary of entities and the chunk they are in.
//for frequent fliers.
const chunks = {};

function angleLerp(a, b, t) {
	shortest_angle = ((((b - a) % (Math.PI*2)) + (Math.PI*3)) % (Math.PI*2)) - Math.PI;
    return shortest_angle * t;
}

let serverPositions = {};
let teleport = {};
let lastUpdated = Date.now();

entities.emitter.on('loaded', () => {

	entities.emitter.on('physicsConfigAddedFromChunkLoader', entity => {
		setImmediate(
			() => {
				if(entities.find('body').indexOf(entity) !== -1) {
					let body = entities.getComponent(entity, "body");
					if(body !== undefined) {
						body.shouldTeleport = true;
					}
				}
			}
		);
	});

	entities.emitter.on('physicsConfigUnloadedFromChunk', (physConf, entity) => {
		let body = entities.getComponent(entity, "body");

		physConf.object.bodyConfig.position = body.position;
		physConf.object.bodyConfig.angle = body.angle;
	});

	server.on('teleport', data => {
		let entity = entities.find('serverId').filter(entity =>
			entities.getComponent(entity, "serverId") === data.serverId
		)[0];
		let body = entities.getComponent(entity, "body");

		body.position = data.to;
	});
	
	entities.emitter.on('bodyCreate', entity => {
		serverPositions[entity] = {};
	});

	//physics comes with a megapacket which contains
	//orientation/velocity data for all physics objects.
	server.on('physics', megapacket => {
		lastUpdated = Date.now();

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
			let deltaPercent = (Date.now() - lastUpdated)/(1000);
			

			if(!body.shouldTeleport) {
				if(key === "position")
					p2.vec2.lerp(
						value,
						value,
						goalValue,
						delta
					);
			}

			else {
				p2.vec2.copy(
					value,
					goalValue
				);
				body.shouldTeleport = false;
			}

			if(key === "angle") {
				value = angleLerp(
					value,
					goalValue,
					deltaPercent
				);
			}
		});
	}
};

