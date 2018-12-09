function smoothStep(x) { //Normal smoothstep
	return -2 * Math.pow(x, 3) + 3 * Math.pow(x, 2);
}

module.exports = {
	componentTypesAffected: ["fade"],
	update: (entity, frameDelta) => {
		let fade = entities.getComponent(entity, "fade");
		let a = entities.getComponent(entity, "appearance");

		if(fade.startTime === undefined)
			fade.startTime = Date.now();

		let delta = (Date.now() - fade.startTime)/fade.timeToGone;

		if(fade.fadingOut)
			delta = 1 - delta;

		else
			delta -= 1;
		
		a.transparency = smoothStep(delta);

		if(fade.fadeBackIn && delta <= 0)
			fade.fadingOut = false;

		if((fade.fadingOut && delta <= 0) || (!fade.fadingOut && delta >= 1)) {
			if(fade.removeComponent)
				entities.removeComponent(entity, "fade");
			if(fade.removeEntity)
				entities.destroy(entity);
		}
	}
}
