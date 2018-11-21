const p2 = require('../../src/p2.min.js');
const velocities = {};

entities.emitter.on('clientCreate', entity => {
	let client = entities.getComponent(entity, "client");

	client.on("inputUpdate", input => {
		console.log('here');
		let mA = input.movementAxis;

		//flip the Y axis so that the controller input
		//aligns with our cartesian plane
		mA[1] = mA[1] * -1;

		//give it a uniform length, so that
		//to apply speed you can just multiply
		p2.vec2.normalize(mA, mA);

		//finally, multiply the velocity by whatever you want
		//their speed to be. 1 is too high.
		p2.vec2.scale(mA, mA, 0.25);

		//let's store this so we can apply it in the update loop.
		velocities[entity] = mA;
	});
});

module.exports = {
	update: () => {
		Object.keys(velocities).forEach(entity => {
			let body = entities.getComponent(entity, "body");
			let velocity = velocities[entity];

			console.log(velocity);
			
			p2.vec2.add(body.velocity, body.velocity, velocity);
		})
	}
};
