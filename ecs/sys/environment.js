const fs = require('fse');
const path = require('path');
var map;

function makeMap() {
	const sceneItems = require('../../gamedata/constants/sceneItems.json');
	const mapGenConfig = require('../../src/gamedata/constants/mapGenConfig.json');

	function grabValue(min, max) {

		//the parameters might not be so straightforward.
		if(max === undefined) {
			//if it's just a straight up value, use that.
			if(typeof min !== "object") {
				console.log(min, typeof min);
				return min;
			}

			//otherwise, min is an object with a min and max inside.
			max = min.max;
			min = min.min;
		}

		return min + Math.random()*(max - min);
	}

	map = [];

	sceneItems.forEach(type => {
		//items are spawned per 100 units.
		//map Hectameters.
		let mapHm = mapGenConfig.size/100;
		for(let i = mapHm/-2; i < mapHm/2; i++) {
			//the rate variable in the JSON is how many per 100
			for(let j = 0; j < type.rate; j++) {

				let item = {
					physicsConfig: {
						shapeConfig: {
							width: grabValue(type.size.width),
							height: grabValue(type.size.height),
						},
						//can't compute bodyConfig here because 
						//you need to know the shape values.
					}
				};

				//compute item.physicsConfig
				let sC = item.physicsConfig.shapeConfig;
				item.physicsConfig.bodyConfig = {
					mass: sC.width * sC.height * type.density,
					position: [
						//randomly interspersed through the 100
						(Math.random() + i) * 100,
						//resting on the ground
						sC.height/2
					]
				}

				map.push(item);
			}
		}
	});
}

module.exports = {
	load: new Promise(resolve => {
		fs.readFile(
			path.resolve(
				__dirname, 
				'../../gamedata/world/staticBodies.json'
			),
			"utf8"
		).catch(makeMap).then(data => {
			//map will be set to a newly generated map if a file couldn't be found.
			//otherwise, it'll have found the file and it'll pass it as data.
			//also this could be bad because readFile could resolve something.
			if(data)
				map = data;

			resolve();
		});
	})
};
