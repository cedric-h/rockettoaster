const broadcast = require('../../helper/broadcast.js');
const {vec2} = require('../../src/p2.min.js');

const particleVelocity = vec2.create();

function grab(o) {
	if(typeof o !== "object")
		return o;

	else
		return o.min + Math.random()*(o.max - o.min);
}

const randomVec = vec2.create();
const straightUp = vec2.fromValues(0, 1);
function spawnParticles(particles, color, count, spawnAt, flingTowards) {

	count = (typeof count === "number")
		? count*particles.perDamagePointDealt
		: particles.count;

	for(let i = 0; i < count; i++) {
		let size = grab(particles.size);

		if(typeof particles.force !== undefined) {

			if(!flingTowards) {
				vec2.rotate(
					randomVec,
					straightUp,
					Math.PI*2 * Math.random()
				);
			}

			vec2.scale(
				particleVelocity,
				flingTowards || randomVec,
				grab(particles.force)
			);
		}

		vec2.rotate(
			particleVelocity,
			particleVelocity,
			(Math.random() * particles.spread) - particles.spread/2
		);

		broadcast('newEntity', [
			{
				name: "appearance",
				object: {
					zIndex: 0,
					color: color || "snow",
				},
			},
			{
				name: "physicsConfig",
				object: {
					bodyConfig: {
						position: spawnAt,
						velocity: particleVelocity,
						mass: 1
					},
					shapeConfig: {
						height: size,
						width: size,
						boundingRadius: size
					},
					shapeType: "Particle",
					physical: true
				}
			},
			{
				name: "fade",
				object: {
					fadeBackIn: false,
					timeToGone: grab(particles.lifeTime),
					removeComponent: false,
					removeEntity: true
				}
			}
		]);
	}
}

const makeParticlesFor = (particleType, victimE, shooterE, raycastResult, contactPoint, damage) => {
	let particles = entities.getComponent(victimE, particleType + "Particles");

	if(typeof particles !== "undefined") {
		let color = particles.color || entities.getComponent(victimE, "clientSideComponents")
			.filter(component => component.name === "appearance")[0].object.color;

		spawnParticles(
			particles, 
			color, 
			damage, 
			contactPoint || entities.getComponent(victimE, "body").position,
			raycastResult
				? raycastResult.normal
				: undefined
		);
	}
}

[	//on this					//make particles for this
	["damageDealt", 			"damage"],
	["entityKilled", 			"death"]
].forEach(listener => {
	entities.emitter.on(listener[0], (...a) => makeParticlesFor(listener[1], ...a))
});


module.exports = {
};

