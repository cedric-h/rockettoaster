const p2 = require('./../../p2.min');

//configure physics world.
let world = new p2.World({
	gravity: [0, -3,82]
});

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
	world.addBody(physicsConfig.body)

	entities.entities[entity].body = physicsConfig.body;
});

entities.emitter.on('physicsConfigAddedFromServer', entity => {
	let physicsConfig = entities.getComponent(entity, 'physicsConfig');

	physicsConfig.shape = new p2.Box(physicsConfig.shapeConfig);
	physicsConfig.body  = new p2.Body(physicsConfig.bodyConfig);

	entities.addComponent(entity, "body");
});


module.exports = {
	serverCompatible: true,
	update: (entities, delta) => {
		world.step(1/60, delta, 10);
	}
};
