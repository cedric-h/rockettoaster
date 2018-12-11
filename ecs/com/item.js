module.exports = {
	factory: () => {
		return {
		}
	},
	reset: item => {
		Object.keys(item).forEach(key => {
			delete item[key];
		});
	}
}
