//libs
const {vec2} = require("../../src/p2.min.js");
const fs = require('fse');
const path = require('path');

//json files
const itemTypes = require('glob')
	.sync('gamedata/constants/sceneItems/**/*.json')
	.map(fileName => require('../../' + fileName));
const worldConfig = require('../../src/gamedata/constants/worldConfig.json');

//external files that needed to be .js
const spawn = require('../../helper/spawn.js');

var map;

const tagFiles = [
	{
		"name": "tier",
		"values": require('../../gamedata/constants/tiers.json')
	},
	{
		"name" : "weaponType",
		"values": require('../../gamedata/constants/weaponTypes.json')
	}
];


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
	//for when you need a minimum amount of a type of item.
	let itemCount = 0;
	//items are spawned on a per chunk basis.
	let chunkSize = worldConfig.chunkSize;
	//map size in hectameters.
	let mapHm = worldConfig.size/chunkSize;
	//let's clear out the map so we can fill it up again.
	map = [];


	const childPos = vec2.create();
	function addItem(type, position) {
		//if it's an item that just holds more items,
		//make the items it holds.
		if(type.parentType) {
			for(let j = 0; j < type.childCount; j++) {
				vec2.add(
					childPos,
					position,
					vec2.scale(
						vec2.create(),
						vec2.fromValues(...type.spacingBetweenChildren),
						j
					)
				);
				addItem(type.childType, vec2.clone(childPos));
			}
		}

		//but if it's an actual, real, actual, viewable item,
		//add that to the map.
		else {
			let item = spawn.getJSON(type);
			item.physicsConfig.bodyConfig.position = vec2.add(
				position,
				position,
				vec2.fromValues(
					0,
					(typeof type.layFlat === "undefined" || type.layFlat)
						? item.physicsConfig.shapeConfig.height/2
						: 0
				)
			);
			map.push(item);
		}
	}


	function addItemInChunk(type, chunkIndex) {
		return addItem(type, vec2.fromValues(
			//randomly interspersed through the chunk
			chunkIndex * chunkSize + (
				typeof type.chunkRelativeX === "undefined"
					? (Math.random() * chunkSize)
					: type.chunkRelativeX
				),
			//resting on the ground
			//the yOffset paremeter allows you to have some things
			//stick over or in the ground a bit.
			grabValue(type.yOffset) || 0
		));
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
						addItemInChunk(type, i);
						itemCount++;
					}

				if(Math.random() < howManyItems) {
					addItemInChunk(type, i);
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
		let entity = spawn.json(item);

		//because we want to generate a new map then.
		entities.addComponent(entity, "removeOnGameReset");
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
