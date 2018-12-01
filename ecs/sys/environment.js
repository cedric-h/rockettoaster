const fs = require('fse');
const path = require('path');
const colors = require('../../src/gamedata/constants/colors.json');
const itemTypes = require('../../gamedata/constants/sceneItems.json');
const addComponentsList = require('../../src/helper/addComponentsList.js');
var map;

let defaultComponents = {
	"appearance": {
		"server": false,
		"client": true,
		"object": {
			"color": "colors.json"
		}
	}
};

//we don't do this during module.exports.load because at 
//that point, the ECS isn't finished being set up.
entities.emitter.on('loaded', () => {
	//let's add each scene item to the ECS
	map.forEach(item => {
		let type = itemTypes.filter(type => type.name === item.type)[0];
		let entity = entities.create();
		entities.addComponent(entity, "physicsConfig");

		//add components where special behavior is required
		let physicsConfig = entities.getComponent(entity, "physicsConfig");
		Object.assign(physicsConfig, item.physicsConfig);
		entities.emitter.emit('bodyFromBox', entity);

		//add generic components that we want here on the server,
		//which may or may not be ones that are also on the client.
		addComponentsList(entity, type.components.filter(c => c.server));

		//add the generic components that we want on the client.
		entities.addComponent(entity, "clientSideComponents");
		let clientSideComponents = entities.getComponent(entity, "clientSideComponents");
		clientSideComponents.push(
			...type.components
			.map(c => defaultComponents[c.name]
				? Object.assign(JSON.parse(JSON.stringify(defaultComponents[c.name])), c)
				: c
			)
			.filter(c => 
				c.client
			)
		);

		//replace the appearance com with the color in colors.json
		//this way the colors for everything can be in one place,
		//and you don't have to sift through the world gen info to change them.
		//note that item.type is used to fetch the color, not the type object.
		//that's because the object is indexed by the name of the type, not the info.
		let appearance = clientSideComponents.filter(c => c.name === "appearance")[0];
		appearance.object.color = colors[item.type] || appearance.object.color;
	});
});

function makeMap() {
	const mapGenConfig = require('../../src/gamedata/constants/mapGenConfig.json');

	//takes three possible inputs:
	//min is the only value. If this is the case, min is returned.
	//min and max are both values. then, a value between them is returned.
	//min is an object with a min and max. a value between these two is returned.
	function grabValue(min, max) {

		//the parameters might not be so straightforward.
		if(max === undefined) {
			//if it's just a straightforward value, use that.
			if(typeof min !== "object") {
				return min;
			}

			//otherwise, min is an object with a min and max inside.
			max = min.max;
			min = min.min;
		}

		return min + Math.random()*(max - min);
	}

	map = [];

	itemTypes.forEach(type => {
		//items are spawned per 100 units.
		//map Hectameters.
		let chunkSize = mapGenConfig.chunkSize;
		let mapHm = mapGenConfig.size/chunkSize;
		for(let i = mapHm/-2; i < mapHm/2; i++) {
			//the rate variable in the JSON is how many per chunk
			for(let j = 0; j < type.rate; j++) {

				let item = {
					type: type.name,
					physicsConfig: {
						shapeConfig: {
							width: grabValue(type.size.width),
							height: grabValue(type.size.height),
						},
						//can't compute bodyConfig here because 
						//you need to know the shape values.
					}
				};

				item.physicsConfig.physical = (typeof type.physical === "undefined")
					? true
					: type.physical;

				//compute item.physicsConfig
				let sC = item.physicsConfig.shapeConfig;
				item.physicsConfig.bodyConfig = {
					mass: sC.width * sC.height * type.density,
					position: [
						//randomly interspersed through the chunk
						(Math.random() + i) * chunkSize,
						//resting on the ground
						//the yOffset paremeter allows you to have some things
						//stick over or in the ground a bit.
						sC.height/2 + (grabValue(type.yOffset) || 0)
					]
				};

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
