const WebSocket = require('ws');
const p2 = require('../../src/p2.min');
const vec2 = p2.vec2;

const broadcast = require('../../helper/broadcast.js');

const physicsConstants = require('../../gamedata/constants/physics.json');
const collisionGroups = require('../../gamedata/constants/collisionGroups.js');
const colors = require('../../src/gamedata/constants/colors.json');
const worldConfig = require('../../src/gamedata/constants/worldConfig.json');

var wss;

const positionAtStart = (function() {

	const startPositions = {
		cyan: [ worldConfig.size/2, 1],
		lime: [-worldConfig.size/2, 1]
	};

	return (entity) => {
		let team = entities.getComponent(entity, "team");
		let body = entities.getComponent(entity, "body") || {position: vec2.create()};
		vec2.copy(body.position, startPositions[team]);
		body.position[0] += Math.sign(startPositions[team][0]) * -2 * (entities.find('team').indexOf(entity) || 1);
		return body.position;
	}
})();


entities.emitter.on('shareNewEntity', newEntity => {
	broadcast('newEntity', packetFromEntity(newEntity));
});

entities.emitter.on('playerKilled', entity => {
	broadcast('teleport', {
		serverId: entity, 
		to: positionAtStart(entity)
	});
});

//after a game has been one, we one to reset the map.
//when that happens, we want to tell the players what the new map looks like
//and teleport all players to their team spawns.
entities.emitter.on('resetDone', () => {
	//resend all of the things that last only one game
	entities.find('body').forEach(entity => { //all physics bodies,
		//the player's physicsConfig hasn't been turned into one of these yet.

		if(typeof entities.getComponent(entity, "removeOnGameReset") !== "undefined")
			broadcast('newEntity', packetFromEntity(entity));
	});

	entities.find('client').forEach(entity => {
		if(typeof entities.getComponent(entity, "team") !== "undefined")
			broadcast('teleport', {
				serverId: entity, 
				to: positionAtStart(entity)
			});
	});
});


entities.emitter.on('loaded', () => {

	wss = new WebSocket.Server({
		port: 3001
	});

	wss.on('connection', ws => {
		console.log('player connected!');
		//make a new player
		let newPlayer = entities.create();

		//add networking
		//add client component and assign it to their websocket.
		entities.addComponent(newPlayer, "client");
		entities.getComponent(newPlayer, "client").initialize(ws);

		entities.emitter.emit('playerInMenu', newPlayer);

		let client = entities.getComponent(newPlayer, "client");

		//let's tell this player about the physics objects :D
		//this way he'll have a neat little login screen.
		entities.find('body').forEach(entity => { //all physics bodies,
			//the player's physicsConfig hasn't been turned into one of these yet.
			client.send("newEntity", packetFromEntity(entity));
		});

		client.once("teamChosen", data => {
			entities.emitter.emit(newPlayer + "JoinedGame");
			addPlayer(newPlayer, data.team);
		});

		//if they leave, tell everyone they leaved, and then get rid of them.
		//no hard feelings though
		ws.on('close', () => {
			//seeing if they have a component that isn't added onto them until the other players need to know about them
			//lets us know if we need to tell them to remove the player that just left.
			if(typeof entities.getComponent(newPlayer, "clientSideComponents") !== "undefined") {
				broadcast('destroyEntity', newPlayer);
			}
			entities.destroy(newPlayer);
		});
	});
});

//this function pulls the relevant information out of an entity's components.
function packetFromEntity(entity) {
	let physicsConfig = entities.getComponent(entity, "physicsConfig");
	let updatedBodyConfig = JSON.parse(JSON.stringify(physicsConfig.bodyConfig));
	let body = entities.getComponent(entity, "body");

	if(body && physicsConfig.physical) {
		//copy over physics info, like position and angle, into bodyConfig
		//so the body will start in a reasonable position.
		physicsConstants.recieveKeys.forEach((key, index) => {
			updatedBodyConfig[key] = body[physicsConstants.transmitKeys[index]];
		});
	}


	return [
		{
			name: "physicsConfig",
			object: {
				bodyConfig: updatedBodyConfig,
				shapeConfig: physicsConfig.shapeConfig,
				physical: physicsConfig.physical,
				shapeType: physicsConfig.shapeType
			}
		}, {
			name: "serverId",
			value: entity
		}
	].concat(entities.getComponent(entity, "clientSideComponents"));
}


function addPlayer(entity, team) {
	console.log('player chose team!');
	
	//record team
	entities.addComponent(entity, "team");
	entities.setComponent(entity, "team", team);
	
	//record team
	entities.addComponent(entity, "health");

	//particles
	entities.addComponent(entity, "damageParticles");
	let damageParticles = entities.getComponent(entity, "damageParticles");
	Object.assign(damageParticles, {
		"spread": 0.6283185307179586,
		"perDamagePointDealt": 4,
		"color": (team === "cyan") ? "#A32ACA" : "#77f051",
		"size": {
			"min": 0.1,
			"max": 0.2
		},
		"force": {
			"min": 3,
			"max": 9
		},
		"lifeTime": {
			"min": 1500,
			"max": 3500
		}
	});

	entities.addComponent(entity, "deathParticles");
	let deathParticles = entities.getComponent(entity, "deathParticles");
	Object.assign(deathParticles, {
		"spread": 0.6283185307179586,
		"count": 5,
		"color": (team === "lime") ? "#c4ff71" : team,
		"size": {
			"min": 0.2,
			"max": 0.3
		},
		"force": 12,
		"lifeTime": {
			"min": 1000,
			"max": 2000
		}
	});

	//add inventory
	entities.addComponent(entity, "inventory");
	let inventory = entities.getComponent(entity, "inventory");
	inventory.size = 1;

	//add physics
	//add a physicsConfig to configure and then turn into a body component.
	entities.addComponent(entity, "physicsConfig");
	//grab the physicsConfig and configure it
	let physicsConfig = entities.getComponent(entity, "physicsConfig");
	physicsConfig.shapeConfig = {
		width: 0.5,
		height: 0.5,
		collisionGroup: collisionGroups[team + "Team"]
	};
	physicsConfig.bodyConfig = {
		mass: 5,
		position: positionAtStart(entity)
	};

	entities.addComponent(entity, "clientSideComponents");
	let clientSideComponents = entities.getComponent(entity, "clientSideComponents")
	clientSideComponents.push(...[
		{
			"name": "appearance",
			"object": {
				"color": colors[team + "Team"]
			}
		},
	]);


	//now that we have all of the components we need, let's tell
	//the clients about this brand new player.
	//the client automatically adds a body if it sees a body config,
	//because we can't just send over an entire body; they're recursive,
	//so they can't be serialized, and they're just big, so it's easier
	//just to send what the server used to make the bodies, so they can
	//just make copies of those using the same configurations.

	//this object contains all of the information that the
	//other players need to have about this player. The player
	//that controls this entity is told a bit more, in addition
	//to this.
	let baseComponentList = packetFromEntity(entity);/*a list of components...*/  

	entities.find('client').forEach(entity => {
		let client = entities.getComponent(entity, "client");
		
		if(entity !== entity)
			client.send('newEntity', baseComponentList);

		else //you're telling them about themselves, so...
			client.send('newEntity', baseComponentList.concat([
				{
					name: "localPlayer",
					value: true
				},
				{
					name: "cameraFocus",
					value: true
				}
			]));
	});
	

	//finally, turn that physicsConfig component into a body component.
	entities.emitter.emit('bodyFromBox', entity);
};


module.exports = {
};
