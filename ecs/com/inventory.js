
module.exports = {
	factory: () => {
		return {
			items: []
		};
	},
	reset: inventory => {
		inventory.items = [];
		inventory.weapon = undefined;
	}
};
