
module.exports = {
	factory: () => {
		return {
			speed: 0,
			minimumDistance: 20
		};
	},
	reset: chasing => {
		chasing.speed = 0;
		chasing.minimumDistance = 20;
	}
};
