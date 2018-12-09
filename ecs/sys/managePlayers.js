const WebSocket = require('ws');
const p2 = require('../../src/p2.min');

const broadcast = require('../../helper/broadcast.js');

const physicsConstants = require('../../gamedata/constants/physics.json');
const collisionGroups = require('../../gamedata/constants/collisionGroups.js');
const colors = require('../../src/gamedata/constants/colors.json');
const mapGenConfig = require('../../src/gamedata/constants/mapGenConfig.json');

global.teams = {
	cyan: {
		startPos: [ mapGenConfig.size/2 - 3, 1],
	},
	lime: {
		startPos: [-mapGenConfig.size/2 + 3, 1],
	}
};

var wss;

entities.emitter.on('loaded', () => {

	wss = new WebSocket.Server({
		port: 8080
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
				physical: physicsConfig.physical
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

	//add inventory
	entities.addComponent(entity, "inventory");

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
		position: [
			//space them out based on how many people are in the game
			//you could base it on how many specific people on one team are in,
			//but meh, some gaps don't hurt anyone.
			teams[team].startPos[0] + 3 * entities.find('team').length,
			teams[team].startPos[1]
		]
	};

	entities.addComponent(entity, "clientSideComponents");
	let clientSideComponents = entities.getComponent(entity, "clientSideComponents")
	clientSideComponents.push(...[
		{
			name: "appearance",
			object: {
				color: colors[team + "Team"]
			}
		},
	]);


	//now that we have all of the components we need, let's tell
	//the clients about this brand new thing.
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
