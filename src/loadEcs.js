//components and systems are asynchronously loaded in case you need to i.e. load some images

//parameters are objects
module.exports = (systemsFiles, componentFiles) => {
	return Promise.all([
		//systems
		new Promise((resolve, reject) => {
			let systemLoadPromises = [];

			//prepare the systems for loading
			systemsFiles.forEach(systemModule => {
				if(systemModule.componentTypesAffected) {

					//register the ECS search for componentTypesAffected
					searchName = systemModule.searchName || systemModule.componentTypesAffected[0];

					//try catch because it complains if the search is already registered :D
					try {
						entities.registerSearch(searchName, systemModule.componentTypesAffected);
					}

					catch(error) {

					};
				}

				if(systemModule.load)
					systemLoadPromises.push(systemModule.load);
			});

			//load those guys
			Promise.all(systemLoadPromises).then(() => {
				//now that all of the systems are loaded, let's add them to the ECS
				systemsFiles.forEach(system => {

					if(system.update) {

						if(system.componentTypesAffected) {

							if(system.searchName === undefined && system.componentTypesAffected.length > 0)
								throw new Error(system.name + ": searchName is required when more than one componentTypesAffected are present.");

							let searchName = system.searchName || system.componentTypesAffected[0];
							ecs.addEach(system.update, searchName);
						}

						//if they didn't specify components that an entity has to have,
						//just add their script to the system so it's called once per update.
						else
							ecs.add(system.update);
					}
				});

				resolve();
			});
		}),

		//components
		new Promise((resolve, reject) => {

			//load them all
			Promise.all(componentFiles.map(component => component.load)).then(() => {
				componentFiles.forEach((component) => {
					entities.registerComponent(
						component.name,
						component.factory,
						component.reset,
						component.maxCount
					);
				});

				resolve();
			});
		})
	]);
}
