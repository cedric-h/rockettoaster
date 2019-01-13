const {vec2} = require('../../p2.min.js');
//without this script, the camera would glide from 0,0 to wherever the spawnDias is.
//that's undesirable, so this makes the camera snap to where the player's spawn point is.
//it then removes the camera focus component from that entity, because once the player logs in, they will become the camera 
//focus, and you really only want two camera focuses.

entities.emitter.once('cameraFocusCreate', entity => {
	//snap the camera where the camera focus is
	//as soon as the camera focus has a body.
	setImmediate(() => {
		if(entities.getComponent(entity, "localPlayer") === undefined) {
			vec2.scale(
				camera.position,
				entities.getComponent(entity, "body").position,
				-1
			);

			entities.removeComponent(entity, "cameraFocus");

			console.log(entities.find('cameraFocus'));
		}
	});
});

module.exports = {};
