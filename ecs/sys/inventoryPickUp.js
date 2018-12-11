let {vec2} = require("../../src/p2.min.js");
let broadcast = require('../../helper/broadcast.js');

entities.emitter.on('pickUpButtonInput', (input, pickerEntity) => {
	let inventory = entities.getComponent(pickerEntity, "inventory");

	//if we have room for one more item and the button is being pressed not released,
	if(inventory.items.length + 1 <= inventory.size && input[0] > 0) {
		let body = entities.getComponent(pickerEntity, "body");

		let itemEntities = entities.find('item').map(itemEntity => {
			let itemBody = entities.getComponent(itemEntity, "body");
			return {
				distance: vec2.distance(body.position, itemBody.position),
				entity: itemEntity
			};
		});
		
		if(itemEntities.length > 0) {

			itemEntities.sort((a, b) => a.distance - b.distance);
			let {distance, entity} = itemEntities[0];

			if(distance < 2) {
				//cloning because item is about to be destroyed then reused
				let item = entities.getComponent(entity, "item");
				let physConf = entities.getComponent(entity, "physicsConfig");
				item.asPhysical = {
					shapeConfig: JSON.parse(JSON.stringify(physConf.shapeConfig)),
					bodyConfig: JSON.parse(JSON.stringify(physConf.bodyConfig)),
					physical: physConf.physical
				};
				item.clientSideComponents = JSON.parse(JSON.stringify(
					entities.getComponent(entity, "clientSideComponents")
				));

				//cloning item and putting it into inventory
				entities.emitter.emit(
					'inventoryAdd', 
					pickerEntity,
					JSON.parse(JSON.stringify(item)) 
				);

				entities.destroy(entity);
				broadcast('destroyEntity', entity);
			}
		}
	}
});

module.exports = {
};
