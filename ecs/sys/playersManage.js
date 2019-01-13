const WebSocket = require('ws');
const p2 = require('../../src/p2.min');
const vec2 = p2.vec2;

const broadcast = require('../../helper/broadcast.js');
const spawn = require('../../helper/spawn.js');

const physicsConstants = require('../../gamedata/constants/physics.json');
const collisionGroups = require('../../gamedata/constants/collisionGroups.js');
const colors = require('../../src/gamedata/constants/colors.json');
const worldConfig = require('../../src/gamedata/constants/worldConfig.json');

var wss;


const startPos = vec2.create();
const startPosOffset = vec2.fromValues(0, 2.5);
const getStartPosition = () => {
	let spawnPoints = entities.find('playerSpawnPoint');

	if(spawnPoints.length > 0)
		vec2.add(
			startPos,
			entities.getComponent(spawnPoints[
				Math.floor(Math.random() * spawnPoints.length)
			], "body").position,
			startPosOffset
		);

	return startPos;
}


entities.emitter.on('shareNewEntity', newEntity => {
	broadcast('newEntity', packetFromEntity(newEntity));
});

entities.emitter.on('playerKilled', entity => {
	broadcast('teleport', {
		serverId: entity, 
		to: getStartPosition()
	});
	let body = entities.getComponent(entity, "body");
	vec2.copy(
		body.position,
		getStartPosition()
	);
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
		let playerSpawnPointEntity = entities.find('playerSpawnPoint')[0];
		entities.find('body').forEach(entity => { //all physics bodies,
			//the player's physicsConfig hasn't been turned into one of these yet.
			
			//center the camera on the thing that's being spawned,
			//if it's where the player will spawn when they finally log in.
			if(entity === playerSpawnPointEntity)
				client.send("newEntity", packetFromEntity(entity).concat([{
					name: "cameraFocus",
					value: true
				}]));

			else
				client.send("newEntity", packetFromEntity(entity));
		});

		client.once("gameJoined", data => {
			entities.emitter.emit(newPlayer + "JoinedGame");
			addPlayer(newPlayer);
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
	console.log('player joined game!');

	spawn.itemAt("player", getStartPosition(), entity);
	console.log(entity);
	
	//now that we have all of the components we need, let's tell
	//the clients about this brand new player.
	//the client automatically adds a body if it sees a physics config,
	//because we can't just send over an entire body; they're recursive,
	//so they can't be serialized, and they're just big, so it's easier
	//just to send what the server used to make the bodies, so they can
	//just make copies of those using the same configurations.

	//this object contains all of the information that the
	//other players need to have about this player. The player
	//that controls this entity is told a bit more, in addition
	//to this.
	let baseComponentList = packetFromEntity(entity);//a list of components...

	entities.find('client').forEach(clientEntity => {
		let client = entities.getComponent(clientEntity, "client");
		
		if(entity !== clientEntity)
			client.send('newEntity', baseComponentList);
		
		//you're telling them about themselves, which was done
		//automatically by the spawn.itemAt, so, just give them the extra coms they need
		else setImmediate(() => 
			client.send('addComponents', {
				serverId: clientEntity,
				components: [
					{
						name: "localPlayer",
						value: true
					},
					{
						name: "cameraFocus",
						value: true
					}
				]
			}));
	});
};


module.exports = {
};
