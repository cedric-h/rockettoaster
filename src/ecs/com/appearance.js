module.exports = {
	factory: () => {
		return {
			color: 'black',
			zIndex: 0
		}
	},
	reset: appearance => {
		appearance.transparency = 1;
		appearance.type = undefined;
		appearance.zIndex = 0;
	}
};
