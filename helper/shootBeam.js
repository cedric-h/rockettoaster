const {vec2, RaycastResult, Ray} = require('../src/p2.min.js');
const collisionGroups = require('../gamedata/constants/collisionGroups.js');
const broadcast = require('../helper/broadcast.js');

const result = new RaycastResult();
const ray = new Ray({
	mode: Ray.CLOSEST
});
const aim = vec2.create();
const knockback = vec2.create();

function shootOnce(inputAim, shooterEntity, weapon) {
	let collisionGroup = entities.getComponent(shooterEntity, "physicsConfig").shapeConfig.collisionGroup;
	let shooterBody = entities.getComponent(shooterEntity, "body");

	vec2.copy(aim, inputAim);

	vec2.normalize(aim, aim);

	shooterBody.applyForce(
		vec2.scale(knockback, aim, -weapon.knockBack)
	);

	//scale start a bit towards the player, but scale aim bunches away from the player
	vec2.scale(aim, aim, weapon.range);

	//make each relative to the player's position
	vec2.add(aim, shooterBody.position, aim);

	//set ray to go from the player's position to aim
	vec2.copy(ray.from, shooterBody.position);
	vec2.copy(ray.to, aim);

	//prepare the raycasting objects and raycast
	ray.collisionMask = ~collisionGroup;
	ray.update();
	result.reset();
	world.raycast(result, ray);

	//copy point of contact into hitPoint
	if(result.hasHit()) {
		result.getHitPoint(aim, ray);

		//if the thing we hit is a card carrying entity, which still exists
		if(typeof result.body.id === "number" && entities.find('body').indexOf(result.body.id) !== -1) {
			let victimEntity = result.body.id;

			//push 'em
			result.body.applyForce(
				vec2.scale(ray.direction, ray.direction, weapon.pushForce)
			);

			//hurt 'em
			entities.emitter.emit(
				"weaponDamage",
				victimEntity,
				shooterEntity,
				result,
				aim,
				weapon
			);
		}
	}

	//result.normal could be useful for throwing particles

	//add laser
	broadcast('newEntity', [
		{
			name: "appearance",
			object: {
				zIndex: 0,
				color: weapon.laserColor,
				type: "line",
				lineWidth: weapon.laserThickness,
				coords: [
					shooterBody.position,
					aim
				]
			}
		},
		{
			name: "fade",
			object: {
				fadeBackIn: false,
				timeToGone: weapon.laserFadeTime,
				removeComponent: false,
				removeEntity: true,
			}
		}
	]);
}

const rotatedAim = vec2.create();
module.exports = (inputAim, shooterEntity, wep) => {
	
	if(wep.canShootTime === undefined || wep.canShootTime <= Date.now()) {
		wep.canShootTime = Date.now() + wep.coolDown;

		if(wep.beams > 1) {
			let totalRange = (wep.beams - 1)*wep.spread;
			for(let i = totalRange/-2; i <= totalRange/2; i+= wep.spread) {
				vec2.rotate(
					rotatedAim,
					inputAim,
					i
				);
				shootOnce(
					rotatedAim,
					shooterEntity,
					wep
				);
			}
		}

		else
			shootOnce(inputAim, shooterEntity, wep);
	}
}
