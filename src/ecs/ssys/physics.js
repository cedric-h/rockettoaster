const p2 = require('./../../p2.min');

//configure physics world.
//it's a resource, because it needs to be grabbable for raycasting
let world = new p2.World({
	gravity: [0, -3,82]
});

if(typeof window !== "undefined")
	window.world = world;

else
	global.world = world;

//add a ground
let ground = new p2.Body();
ground.addShape(new p2.Plane());
world.addBody(ground);

//add two left/right boundary walls
[-1, 1].forEach(direction => {
	let wall = new p2.Body({
		angle: Math.PI * (direction == true ? 0.5 : 1.5),
		position: [100*direction, 0]
	});
	wall.addShape(new p2.Plane());
	world.addBody(wall);
});


//the body component is really just a wrapper around the physicsConfig.body object.
entities.emitter.on('bodyCreate', entity => {
	let physicsConfig = entities.getComponent(entity, "physicsConfig");

	if(!physicsConfig)
		throw new Error("You can't add a body component to an entity without a physicsConfig component.");

	physicsConfig.body.addShape(physicsConfig.shape);

	if(physicsConfig.physical)
		world.addBody(physicsConfig.body);

	entities.entities[entity].body = physicsConfig.body;
});

//ease of use. should be a func, but beats using the update loop to
//listen for a .bodyFromBox flag being set on a physicsConfig object
entities.emitter.on('bodyFromBox', entity => {
	let physicsConfig = entities.getComponent(entity, 'physicsConfig');

	physicsConfig.shape = new p2.Box(physicsConfig.shapeConfig);
	physicsConfig.body  = new p2.Body(physicsConfig.bodyConfig);

	entities.addComponent(entity, "body");
});

//this is a generic event called when a physicsConfig component
//is added based on an instruction from the server, see addFromServer.js
//anyway, for now we'll just call 'bodyFromBox'
entities.emitter.on('physicsConfigAddedFromServer', entity => {
	entities.emitter.emit('bodyFromBox', entity);

	let physicsConfig = entities.getComponent(entity, "physicsConfig");
	if(!physicsConfig.physical) {
		let body = physicsConfig.body;
		body.interpolatedPosition = body.position;
		body.interpolatedAngle = body.angle;
	}
});


module.exports = {
	update: (entities, delta) => {
		world.step(1/60, delta, 10);
	}
};
