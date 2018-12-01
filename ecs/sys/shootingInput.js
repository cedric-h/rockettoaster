const broadcast = require('../../helper/broadcast.js');
const colors = require('../../src/gamedata/constants/colors.json');
const {vec2} = require('../../src/p2.min.js');

entities.emitter.on('weaponTriggerInput', (event, shooterEntity) => {
	let shooterBody = entities.getComponent(shooterEntity, "body");
	//start and end of laser, respectively.
	let aim = event.filter(input => input.name === "aimingAxis")[0].value;
	let start = vec2.create();

	//flip aim's y so it reflects our cartesian plane
	aim[1] *= -1;

	//normalize aim
	vec2.normalize(aim, aim);

	//push the start of the laser away from the player
	vec2.add(start, aim, start);

	//scale start a bit towards the player, but scale aim bunches away from the player
	vec2.scale(start, start, 0.65);
	vec2.scale(aim, aim, 10);

	broadcast('newEntity', [
		{
			name: "appearance",
			object: {
				color: colors.laser,
				type: "line",
				lineWidth: 0.3,
				coords: [
					//make each relative to the player's position
					vec2.add(start, shooterBody.interpolatedPosition, start),
					vec2.add(aim, shooterBody.interpolatedPosition, aim)
				]
			}
		}
	]);
});

module.exports = {
};
