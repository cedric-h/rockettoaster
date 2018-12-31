module.exports = {
	update: delta => {
		entities.find('name').forEach(entity => {
			let name = entities.getComponent(entity, 'name');
			let position = entities.getComponent(entity, 'body').position;
		
			/**
			* TODO:
			*
			*	Render Names to the screen upon either mouse hover, getting near, or some other method
			*/
		});
	}
}