const fs = require('fse');
const path = require('path');
const colors = require('../../src/gamedata/constants/colors.json');
const itemTypes = require('../../gamedata/constants/sceneItems.json');
const addComponentsList = require('../../src/helper/addComponentsList.js');
const collisionGroups = require('../../gamedata/constants/collisionGroups.js');
var map;

const defaultComponents = {
	"appearance": {
		"server": false,
		"client": true,
		"object": {
			"color": "colors.json"
		}
	},
	"item": {
		"server": true,
		"client": false,
		"object": {
		}
	},
	"health": {
		"server": true,
		"client": false,
	},
	"team": {
		"server": true,
		"client": false
	}
};


//we don't do this during module.exports.load because at 
//that point, the ECS isn't finished being set up.
entities.emitter.on('loaded', () => {
	//let's add each scene item to the ECS
	addMapToGame();
});


//when the game resets, remove all existing environment items
//make a new map, and add that.
entities.emitter.on('reset', () => {
	let toRemove = entities.find('removeOnGameReset').splice(0);
	toRemove.forEach(entity => {
		entities.destroy(entity);
		require(
			'../../helper/broadcast.js'
		)('destroyEntity', entity);
	});
	makeMap();
	addMapToGame();
});


function makeMap() {
	const mapGenConfig = require('../../src/gamedata/constants/mapGenConfig.json');
	//for when you need a minimum amount of a type of item.
	let itemCount = 0;
	//items are spawned on a per chunk basis.
	let chunkSize = mapGenConfig.chunkSize;
	//map size in hectameters.
	let mapHm = mapGenConfig.size/chunkSize;
	//let's clear out the map so we can fill it up again.
	map = [];

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

	function makeItem(type, i) {
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

		return item;
	}

	function addForEachChunk(type, shouldLeft=true, shouldRight=true) {
		let leftBound  = shouldLeft  ? mapHm/-2 : 0;
		let rightBound = shouldRight ? mapHm/2  : 0;
		for(let i = leftBound; i < rightBound; i++) {
			//the rate variable in the JSON is how many per chunk

			//find out if the item is in the right area relative to the center of the map.
			let isWithinBounds = true;
			let distance = Math.abs((i >= 0 ? i + 1 : i) / (mapHm/2));
			let bounds = type.centerDistanceBounds;
			if(bounds !== undefined) {
				isWithinBounds = false;
				if(distance <= bounds.max && distance >= bounds.min)
					isWithinBounds = true;
			}

			if(isWithinBounds) {
				//deal with the whole number part of the rate
				let howManyItems = grabValue(type.rate);
				if(howManyItems >= 1)
					for(; 1 <= howManyItems; howManyItems--) {
						map.push(makeItem(type, i));
						itemCount++;
					}

				if(Math.random() < howManyItems) {
					map.push(makeItem(type, i));
					itemCount++;
				}
			}
		}
	}


	itemTypes.forEach(type => {

		if(typeof type.minimumPerSide === "undefined")
			addForEachChunk(type);

		else {
			itemCount = 0;
			while(itemCount < type.minimumPerSide)
				addForEachChunk(type, false, true);

			itemCount = 0;
			while(itemCount < type.minimumPerSide)
				addForEachChunk(type, true, false);
		}
	});
}


function addMapToGame() {
	map.forEach(item => {
		let type = itemTypes.filter(type => type.name === item.type)[0];
		let entity = entities.create();

		//because we want to generate a new map then.
		entities.addComponent(entity, "removeOnGameReset");

		//add components where special behavior is required
		entities.addComponent(entity, "physicsConfig");
		let physicsConfig = entities.getComponent(entity, "physicsConfig");

		//configure physics config
		Object.assign(physicsConfig, item.physicsConfig);
		physicsConfig.shapeConfig.collisionGroup = collisionGroups.terrain;

		entities.emitter.emit('bodyFromBox', entity);

		//add generic components that we want here on the server,
		//which may or may not be ones that are also on the client.
		type.components = type.components
			.map(c => defaultComponents[c.name]
				? Object.assign(JSON.parse(JSON.stringify(defaultComponents[c.name])), c)
				: c
			);

		addComponentsList(entity, type.components.filter(c => c.server));

		//add the generic components that we want on the client.
		entities.addComponent(entity, "clientSideComponents");
		let clientSideComponents = entities.getComponent(entity, "clientSideComponents");
		clientSideComponents.push(
			...type.components
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
