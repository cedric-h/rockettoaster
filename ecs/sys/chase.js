const {vec2} = require("../../src/p2.min.js");
const findClosest = require('../../helper/findClosest.js');

const chaserVelocity = vec2.create();
function chase(chaserEntity, closestClientEntity, delta) {
	let clientPosition = entities.getComponent(closestClientEntity, "body").position;
	let chaserPosition = entities.getComponent(chaserEntity, "body").position;

	let chasing = entities.getComponent(chaserEntity, 'chasing');

	vec2.subtract(
		chaserVelocity,
		clientPosition,
		chaserPosition
	);

	vec2.normalize(
		chaserVelocity,
		chaserVelocity
	);

	vec2.scale(
		chaserVelocity,
		chaserVelocity,
		chasing.speed * delta
	);

	let chaserPhysicsBody = entities.getComponent(chaserEntity, "body");

	vec2.add(
		chaserPhysicsBody.velocity,
		chaserVelocity,
		chaserPhysicsBody.velocity
	);
}

module.exports = {
    update: (entities, delta) => {
        entities.find('chasing').forEach(chaserEntity => {
            let chasing = entities.getComponent(chaserEntity, 'chasing');

			findClosest(
				//the bank of entities to choose the closest thing from.
				entities.find('client'),
				//the position to find the closest thing to
				entities.getComponent(chaserEntity, "body").position,
				//callback, only called if position can be found.
				closestClientEntity => {
					chase(chaserEntity, closestClientEntity, delta);

					if(chasing.continueChasing)
						//save this guys entity, if we can't find any close entities later,
						//we'll chase him instead.
						chasing.lastChasedEntity = closestClientEntity;
				},
				//minimum distance (optional)
				chasing.minimumDistance,
				//what to do if there isn't anyone close enough.
				() => {
					//if we've chased someone before, and they're still alive and are a client,
					//(their entity hasn't been reused)
					if(
						chasing.continueChasing &&
						chasing.lastChasedEntity !== undefined &&
						entities.find('client').indexOf(chasing.lastChasedEntity) !== -1 &&
						entities.find('body').indexOf(chasing.lastChasedEntity) !== -1
					) {
						let distance = vec2.distance(
							clientPosition = entities.getComponent(chasing.lastChasedEntity, "body").position,
							chaserPosition = entities.getComponent(chaserEntity, "body").position
						);
						if(distance < chasing.stopChasingDistance)
							chase(chaserEntity, chasing.lastChasedEntity, delta);
					}
				}
			);
        });    
    }
};
