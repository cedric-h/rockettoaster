const {vec2} = require("../src/p2.min.js");

module.exports = (bank, goalPosition, callback, minimumDistance, noOneToChaseCallback) => {
	let closestDistance = minimumDistance > 0 ? minimumDistance ** 2 : undefined;
	let closestEntity = undefined;

	bank.forEach(entity => {
		let body = entities.getComponent(entity, "body");

		if(body !== undefined) {
			let distance = vec2.squaredDistance(body.position, goalPosition);

			if (distance <= closestDistance || closestDistance === undefined) {
				closestDistance = distance;
				closestEntity = entity;
			}
		}
	});

	if(closestEntity !== undefined)
		callback(closestEntity);

	else if(noOneToChaseCallback !== undefined)
		noOneToChaseCallback();
}
