module.exports = {
	factory: () => {
		return {
			//automatically defined
			startTime: undefined,
			timeToGone: 1000,
			fadingOut: true,
			//other
			fadeBackIn: undefined,
			removeEntity: undefined,
			removeComponent: undefined,
		}
	},
	reset: component => {
		//automatically defined
		component.startTime = undefined;
		component.timeToGone = 1000;
		component.fadingOut = true;
		//you have to define the otherones yourself,
		//otherwise: undefined behavior
	}
}
