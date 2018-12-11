const addComponentsList = require('../../helper/addComponentsList.js');
//this script adds entities when the server tells the clients to do so.

function addComponents(entity, components) {
	addComponentsList(entity, components);

	//emit an event on each component added,
	//in case any special logic needs to be called.
	components.forEach(component => {
		//in case anything special needs to happen to this component.
		//that might interfere with the Object.assign, but they can
		//just reset that.
		entities.emitter.emit(component.name + "AddedFromServer", entity);
	});
}

entities.emitter.on('loaded', () => {
	
	server.on('newEntity', components => {
		let entity = entities.create();
		addComponents(entity, components);
	});

	server.on('addComponents', data => {
		let entity = entities.find('serverId').filter(entity =>
			entities.getComponent(entity, "serverId") === data.serverId
		)[0];
		addComponents(entity, data.components);
	});

	server.on('destroyEntity', serverId => {
		entities.destroy(
			entities.find('serverId').filter(entity => entities.getComponent(entity, "serverId") === serverId)[0]
		);
	});
});

module.exports = {
}
