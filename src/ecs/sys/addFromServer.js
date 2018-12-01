const addComponentsList = require('../../helper/addComponentsList.js');
//this script adds entities when the server tells the clients to do so.

entities.emitter.on('loaded', () => {
	
	server.on('newEntity', components => {
		let entity = entities.create();

		addComponentsList(entity, components);
		
		//emit an event on each component added,
		//in case any special logic needs to be called.
		components.forEach(component => {
			//in case anything special needs to happen to this component.
			//that might interfere with the Object.assign, but they can
			//just reset that.
			entities.emitter.emit(component.name + "AddedFromServer", entity);
		});
	});
});

module.exports = {
}
