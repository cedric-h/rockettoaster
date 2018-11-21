//this script adds entities when the server tells the clients to do so.

entities.emitter.on('loaded', () => {
	
	server.on('newEntity', components => {
		let entity = entities.create();
		
		//make a default component and overwrite it with the data provided.
		components.forEach(component => {
			entities.addComponent(entity, component.name);

			//takes default value, adds.
			if(component.object)
				Object.assign(
					entities.entities[entity][component.name],
					component.object
				);

			//just straight up overwrites default.
			if(component.value !== undefined)
				entities.setComponent(entity, component.name, component.value);
			
			//in case anything special needs to happen to this component.
			//that might interfere with the Object.assign, but they can
			//just reset that.
			entities.emitter.emit(component.name + "AddedFromServer", entity);
		});

		//console.log(entities.getComponent(entity, "body"));
	});
});

module.exports = {
}
