let {vec2} = require("../../src/p2.min.js");
let broadcast = require('../../helper/broadcast.js');

entities.emitter.on('pickUpButtonInput', (input, pickerEntity) => {

	if(input[0] > 0) {
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
				let item = entities.getComponent(entity, "item");

				//cloning item and putting it into inventory
				//clone because item is about to be destroyed then reused
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
