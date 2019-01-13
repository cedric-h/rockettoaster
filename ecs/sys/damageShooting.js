const broadcast = require('../../helper/broadcast.js');
const colors = require('../../src/gamedata/constants/colors.json');
const {vec2} = require('../../src/p2.min.js');

const shooterInfos = {};

const beamOrProjectile = {
	beam: require('../../helper/shootBeam.js')
};

function shoot(inputAim, shooterEntity, wep) {
	let shoot = beamOrProjectile.beam;

	shoot(inputAim, shooterEntity, wep);
}

entities.emitter.on('clientCreate', entity => {
	shooterInfos[entity] = {
		canShoot: true
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
});


module.exports = {
};
