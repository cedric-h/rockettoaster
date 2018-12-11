const broadcast = require('../../helper/broadcast.js');
const colors = require('../../src/gamedata/constants/colors.json');
const {vec2, RaycastResult, Ray} = require('../../src/p2.min.js');
const collisionGroups = require('../../gamedata/constants/collisionGroups.js');

const result = new RaycastResult();
const ray = new Ray({
	mode: Ray.CLOSEST
});
const aim = vec2.create();
const knockback = vec2.create();

const shooterInfos = {};

function shootOnce(inputAim, shooterEntity, weapon) {
	let team = entities.getComponent(shooterEntity, "team");
	let shooterBody = entities.getComponent(shooterEntity, "body");

	vec2.copy(aim, inputAim);

	vec2.normalize(aim, aim);

	shooterBody.applyForce(
		vec2.scale(knockback, aim, -weapon.knockBack)
	);

	//scale start a bit towards the player, but scale aim bunches away from the player
	vec2.scale(aim, aim, weapon.range);

	//make each relative to the player's position
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

		//if the thing we hit is a card carrying entity, which still exists
		if(typeof result.body.id === "number" && entities.find('body').indexOf(result.body.id) !== -1) {
			let victimEntity = result.body.id;

			//push 'em
			result.body.applyForce(
				vec2.scale(ray.direction, ray.direction, weapon.pushForce)
			);

			//hurt 'em
			entities.emitter.emit("weaponDamage", victimEntity, shooterEntity);
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
					shooterBody.interpolatedPosition,
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
function shoot(inputAim, shooterEntity, wep) {
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

entities.emitter.on('clientCreate', entity => {
	shooterInfos[entity] = {
		canShoot:true
	};
});

//more duct tape because for some reason shooting while flying
//makes it so that you can keep your gun
entities.emitter.on('resetPrepare', () => {
	Object.values(shooterInfos).forEach(inf => {
		inf.canShoot = false;
		clearInterval(inf.shootInterval);
		inf.shootInterval = undefined;
	});
});
entities.emitter.on('resetDone', () => {
	Object.values(shooterInfos).forEach(inf => {
		inf.canShoot = true;
		inf.justShot = false;
	});
});

//to make sure they don't keep shooting indefinitely after their
//inventory has been cleared.
entities.emitter.on('playerKilled', entity => {
	clearInterval(shooterInfos[entity].shootInterval);
});

entities.emitter.on('weaponTriggerInput', (input, shooterEntity) => {
	let inventory = entities.getComponent(shooterEntity, "inventory");
	let weapon = inventory.weapon;
	let inf = shooterInfos[shooterEntity];

	//if they have a weapon, if they're pressing shoot, and they aren't already shooting...
	if(weapon && inf.canShoot) {
		if(input[0] > 0 && inf.shootInterval === undefined && !inf.justShot) {
			//shoot once for starters
			shoot(inf.aim, shooterEntity, weapon);

			//shoot more later, time permitting.
			inf.shootInterval = setInterval(() => {
				if(inf.canShoot)
					shoot(inf.aim, shooterEntity, weapon);
				else
					clearInterval(inf.shootInterval);
			}, weapon.coolDown);
		}

		else if(input[0] === 0 && inf.shootInterval !== undefined) {
			clearInterval(inf.shootInterval);
			inf.shootInterval = undefined;

			inf.justShot = true;

			setTimeout(() => {
				inf.justShot = false;
			}, weapon.coolDown);
		}
	}
});

entities.emitter.on('aimingAxisInput', (input, shooterEntity) => {
	let inf = shooterInfos[shooterEntity];

	inf.aim = input;
	//reflect Y so it is in the same quadrant as us
	inf.aim[1] *= -1;
});
module.exports = {
};
