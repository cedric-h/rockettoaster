const WebSocket = require('ws');
const p2 = require('../../src/p2.min');

const physicsConstants = require('../../gamedata/constants/physics.json');
const colors = require('../../src/gamedata/constants/colors.json');

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

		ws.on('close', () => {
			entities.removeComponent(newPlayer, "client");
		});

		let client = entities.getComponent(newPlayer, "client");
		client.once("teamChosen", data => {
			addPlayer(newPlayer, data.team);
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

	//add physics
	//add a physicsConfig to configure and then turn into a body component.
	entities.addComponent(entity, "physicsConfig");
	//grab the physicsConfig and configure it
	let physicsConfig = entities.getComponent(entity, "physicsConfig");
	physicsConfig.shapeConfig = {
		width: 0.5,
		height: 0.5
	};
	physicsConfig.shape = new p2.Box(
		//we give it a copy because we don't want the original to change.
		JSON.parse(JSON.stringify(physicsConfig.shapeConfig))
	);
	physicsConfig.bodyConfig = {
		mass: 5,
		position: [0, 24]
	};
	physicsConfig.body = new p2.Body(physicsConfig.bodyConfig);	

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

	//now that we've told the other players about
	//this player, let's tell this player about
	//the other players! (and other physics objects) :D
	let newClient = entities.getComponent(entity, "client");
	entities.find('body').forEach(entity => { //all physics bodies,
		//the player's physicsConfig hasn't been turned into one of these yet.
		newClient.send("newEntity", packetFromEntity(entity));
	});
	

	//finally, turn that physicsConfig component into a body component.
	entities.addComponent(entity, "body");
};


module.exports = {
};
