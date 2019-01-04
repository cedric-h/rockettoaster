module.exports = {
	factory: () => {
		return {
		}
	},
	reset: fire => {
		fire.weapon = undefined;
		fire.targetComponent = undefined;
		fire.reflexSlowDown = undefined;
	}
}

