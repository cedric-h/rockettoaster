const broadcast = require('../../helper/broadcast.js');

function grabDamage(weapon) {
	if(weapon.damage)
		return weapon.damage;

	else
		return weapon.damageMin + Math.random()*(weapon.damageMax - weapon.damageMin);
}

entities.emitter.on('playerKilled', entity => {
	entities.setComponent(entity, "health", 5);
});

//E = entity
entities.emitter.on('weaponDamage', (victimE, shooterE, raycastResult, contactPoint) => {
	let health = entities.getComponent(victimE, "health");

	if(typeof health !== "undefined") {
		let inventory = entities.getComponent(shooterE, "inventory");

		if(!inventory.weapon)
			return;

		let damage = (grabDamage(inventory.weapon) || 1);

		entities.setComponent(
			victimE,
			"health",
			health - damage
		);

		entities.emitter.emit("damageDealt",
			victimE,
			shooterE,
			raycastResult,
			contactPoint,
			damage
		);

		if(entities.getComponent(victimE, "health") <= 0) {
			entities.emitter.emit('entityKilled', victimE);

			if(typeof entities.getComponent(victimE, "client") !== "undefined") {
				entities.emitter.emit('playerKilled', victimE);
			}

			else {
				entities.destroy(victimE);
				broadcast('destroyEntity', victimE);
			}
		}
	}
});

module.exports = {
};

