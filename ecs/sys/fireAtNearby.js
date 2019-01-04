const shoot = require('../../helper/shootBeam.js');
const spawn = require('../../helper/spawn.js');
const findClosest = require('../../helper/findClosest.js');
const {vec2} = require('../../src/p2.min.js');

const aim = vec2.create();
const shootingTimes = {};
const aims = {};

function grabShake(fireAtNearby) {
	return fireAtNearby.shakeMin + Math.random()*(fireAtNearby.shakeMax - fireAtNearby.shakeMin) * Math.sign(Math.random() - 0.5);
}

entities.emitter.on('fireAtNearbyCreate', entity => {
	aims[entity] = vec2.create();

	//let weapon get set
	setImmediate(() => {
		let fireAt = entities.getComponent(entity, "fireAtNearby");
		if(typeof fireAt.weapon === "string") {
			fireAt.weapon = spawn.types
				.find(t => t.name === fireAt.weapon).components
					.find(c => c.name === "item").object;

			["damage", "damageMin", "damageMax"].forEach(key => {
				if(fireAt.weapon[key] !== undefined)
					fireAt.weapon[key] *= fireAt.damageMultiplier
			});
		}
	});
});

entities.emitter.on('fireAtNearbyRemove', entity => {
	aims[entity] = undefined;
});

module.exports = {
	update: delta => {
		entities.find('fireAtNearby').forEach(entity => {
			let fireAtNearby = entities.getComponent(entity, "fireAtNearby");
			let firerPosition = entities.getComponent(entity, "body").position;

			findClosest(
				entities.find(fireAtNearby.targetComponent),
				firerPosition,
				closestEntity => {
					vec2.subtract(
						aim,
						entities.getComponent(closestEntity, "body").position,
						firerPosition,
					);
					vec2.normalize(aim, aim);

					if(Math.random() < fireAtNearby.shakeChance)
						vec2.rotate(
							aim,
							aim,
							grabShake(fireAtNearby)
						);

					setTimeout(() => {
						if(aims[entity] !== undefined)
							vec2.copy(aims[entity], aim);
					}, fireAtNearby.reflexSlowDown || 0);

					if(aims[entity] !== undefined) {
						fireAtNearby.weapon.canShootTime = shootingTimes[entity];
						shoot(
							aims[entity],
							entity,
							fireAtNearby.weapon
						);
						shootingTimes[entity] = fireAtNearby.weapon.canShootTime;
					}
				},
				fireAtNearby.weapon.range
			);
		});
	}
}
