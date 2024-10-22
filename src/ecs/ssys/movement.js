const {vec2} = require('../../p2.min.js');
const velocities = {};
const emptyVec = vec2.create();
let gameStarted = (typeof window === "undefined") ? false : true;

entities.emitter.on('bodyRemove', entity => {
	delete velocities[entity];
});

entities.emitter.on('movementAxisInput', (mA, entity) => {
	if(typeof mA !== "undefined") {
		//this prevents cheating by clipping the size of the vector.
		if(vec2.len(mA) > 1)
			vec2.normalize(mA, mA);

		//finally, multiply the velocity by whatever you want
		//their speed to be. 1 is too high.
		vec2.scale(mA, mA, 17.5);

		//let's store this so we can apply it in the update loop.
		velocities[entity] = mA;
	}
});

module.exports = {
	update: (entities, delta) => {
		Object.keys(velocities).forEach(entity => {
			let body = entities.getComponent(entity, "body");
			let v = velocities[entity];
			
			vec2.add(
				body.velocity,
				body.velocity,
				vec2.scale(emptyVec, v, delta)
			);
		})
	}
};
