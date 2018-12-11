
entities.emitter.on('reset', () => {
	entities.find('inventory').forEach(entity => {
		let inventory = entities.getComponent(entity, "inventory");
		inventory.items = [];
		inventory.weapon = undefined;
	});
});

entities.emitter.on('inventoryAdd', (inventoryEntity, item) => {
	let inventory = entities.getComponent(inventoryEntity, "inventory");
	
	inventory.items.push(item);

	if(item.type && typeof inventory[item.type] === "undefined")
		inventory[item.type] = item;
});

module.exports = {};

