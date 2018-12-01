module.exports = (entity, components) => {

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
		else if(typeof component.value !== "undefined")
			entities.setComponent(entity, component.name, component.value);
	});
};
