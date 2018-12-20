module.exports = {
	factory: () => {
		return {
			physical: true,
			shapeType: "Box"
		};
	},
	reset: pC => {
		pC.physical = true;
		pC.shapeType = "Box";
	}
};
