let broadcast = require('../../helper/broadcast.js');
let {vec2} = require("../../src/p2.min.js");
const up = vec2.fromValues(0, 1);

function dropItem(item, dropperEntity) {
	let holderBody = entities.getComponent(dropperEntity, "body");
	let itemEntity = entities.create();

	//there are so many better ways to do this, but this is duct tape for now.
	entities.addComponent(itemEntity, "item");
	let itemEntityItem = entities.getComponent(itemEntity, "item");
	Object.assign(itemEntityItem, item);


	entities.addComponent(itemEntity, "physicsConfig");

	if(item.asPhysical.bodyConfig.position === undefined)
		item.asPhysical.bodyConfig.position = vec2.create();

	vec2.add(item.asPhysical.bodyConfig.position, up, holderBody.position);
	entities.entities[itemEntity].physicsConfig = item.asPhysical;
	entities.emitter.emit('bodyFromBox', itemEntity);


	entities.addComponent(itemEntity, "clientSideComponents");
	let clientSideComponents = entities.getComponent(itemEntity, "clientSideComponents");
	Object.assign(clientSideComponents, item.clientSideComponents);

	entities.addComponent(itemEntity, "removeOnGameReset");

	entities.emitter.emit('shareNewEntity', itemEntity);
}

function emptyInventory(entity) {
	let inventory = entities.getComponent(entity, "inventory");
	inventory.items.forEach(item => dropItem(item, entity));
	inventory.items = [];
	inventory.weapon = undefined;
}

entities.emitter.on('inventoryRemove', emptyInventory);
entities.emitter.on('playerKilled', emptyInventory);

entities.emitter.on('dropButtonInput', (input, dropperEntity) => {
	let inventory = entities.getComponent(dropperEntity, "inventory");

	if(input[0] > 0 && inventory.items.length > 0) {
		let item = inventory.items.splice(0, 1)[0];
		inventory.weapon = undefined;

		dropItem(item, dropperEntity);
	}
});

module.exports = {
};

