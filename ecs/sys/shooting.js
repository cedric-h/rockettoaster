const broadcast = require('../../helper/broadcast.js');
const colors = require('../../src/gamedata/constants/colors.json');
const {vec2, RaycastResult, Ray} = require('../../src/p2.min.js');
const collisionGroups = require('../../gamedata/constants/collisionGroups.js');

const result = new RaycastResult();
const ray = new Ray({
	mode: Ray.CLOSEST
});
let start = vec2.create();

const canShoot = {};

entities.emitter.on('weaponTriggerInput', (event, shooterEntity) => {
	let weapon = entities.getComponent(shooterEntity, "inventory").weapon;
	
	if(weapon && (canShoot[shooterEntity] === undefined || canShoot[shooterEntity])) {
		let shooterBody = entities.getComponent(shooterEntity, "body");
		let team = entities.getComponent(shooterEntity, "team");

		//stop them from shooting again soon
		canShoot[shooterEntity] = false;
		setTimeout(() => {
			canShoot[shooterEntity] = true;
		}, 500);

		//start and end of laser, respectively.
		//start isn't used for raycasting though, that's done from the player's position.
		let aim = event.filter(input => input.name === "aimingAxis")[0].value;

		aim[1] *= -1;

		//normalize aim
		vec2.normalize(aim, aim);

		//the start of the laser is the same direction relative to the player as the end
		vec2.copy(start, aim);

		//scale start a bit towards the player, but scale aim bunches away from the player
		vec2.scale(start, start, 0.35);
		vec2.scale(aim, aim, 15);

		//make each relative to the player's position
		vec2.add(start, shooterBody.interpolatedPosition, start);
		vec2.add(aim, shooterBody.interpolatedPosition, aim);

		//set ray to go from the player's position to aim
		vec2.copy(ray.from, shooterBody.interpolatedPosition);
		vec2.copy(ray.to, aim);

		//prepare the raycasting objects and raycast
		ray.collisionMask = ~collisionGroups[team + "Team"];
		ray.update();
		result.reset();
		world.raycast(result, ray);

		//copy point of contact into hitPoint
		if(result.hasHit()) {
			result.getHitPoint(aim, ray);

			if(typeof result.body.id === "number") {
				result.body.applyForce(
					vec2.scale(ray.direction, ray.direction, 1000)
				);
			}
		}

		//result.normal could be useful for throwing particles

		broadcast('newEntity', [
			{
				name: "appearance",
				object: {
					color: colors.laser,
					type: "line",
					lineWidth: 0.3,
					coords: [
						shooterBody.interpolatedPosition,
						aim
					]
				}
			},
			{
				name: "fade",
				object: {
					fadeBackIn: false,
					timeToGone: 2000,
					removeComponent: false,
					removeEntity: true,
				}
			}
		]);
	}
});

module.exports = {
};
