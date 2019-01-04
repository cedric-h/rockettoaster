const addComponentsList = require('../src/helper/addComponentsList.js');
const {vec2} = require('../src/p2.min.js');
const collisionGroups = require('../gamedata/constants/collisionGroups.js');
const colors = require('../src/gamedata/constants/colors.json');


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


const defaultComponents = {
	"appearance": {
		"server": false,
		"client": true,
		"object": {
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
	"chasing": {
		"server": true,
		"client": false,
	},
	"fireAtNearby": {
		"server": true,
		"client": false,
	},
	"team": {
		"server": true,
		"client": false
	},
	"damageParticles": {
		"server": true,
		"client": false
	},
	"deathParticles": {
		"server": true,
		"client": false
	}
};


//json files
const types = require('glob')
	.sync('gamedata/constants/sceneItems/**/*.json')
	.map(fileName => require('../' + fileName));

const tagFiles = [
	{
		"name": "tier",
		"values": require('../gamedata/constants/tiers.json')
	},
	{
		"name" : "weaponType",
		"values": require('../gamedata/constants/weaponTypes.json')
	}
];

//lets apply data from external tag files, like weaponTypes and tiers.
types.forEach(type => {
	tagFiles.forEach(tag => {
		if(type[tag.name] !== undefined) {
			let tagOfType = type[tag.name];
			let tagData = tag.values[tagOfType];

			if(tagData.object || !tagData.components) {
				if(tagData === undefined)
					throw new Error(
						type.name + "has unknown " + tag.name + ", " + tagOfType
					);

				Object.assign(type, tagData.object || tagData);
			}

			if(tagData.components) {
				type.components.forEach(component => {
					let componentData = tagData.components[component.name];

					if(component.object)
						Object.assign(component.object, componentData);

					else
						component.value = componentData;
				});
			}
		}
	});
});


function replaceChooseFromListWithChoice(obj) {
    for(let k in obj) {
        if(typeof obj[k] === "object" && obj[k] !== null) {

			if(obj[k].chooseFromList) {
				obj[k] = obj[k].list[Math.floor(Math.random()*obj[k].list.length)];
				console.log(obj[k]);
			}

			else
				replaceChooseFromListWithChoice(obj[k]);
		}
    }
}


module.exports = {
	types: types,


	item: name => {
		let entity = module.exports.json(module.exports.getJSON(name));
		
		let item = entities.getComponent(entity, "item");
		if(item !== undefined) {
			let physConf = entities.getComponent(entity, "physicsConfig");
			item.asPhysical = {
				shapeConfig: JSON.parse(JSON.stringify(physConf.shapeConfig)),
				bodyConfig: JSON.parse(JSON.stringify(physConf.bodyConfig)),
				physical: physConf.physical
			};
			item.clientSideComponents = JSON.parse(JSON.stringify(
				entities.getComponent(entity, "clientSideComponents")
			));
		}

		setImmediate(() => 
			entities.emitter.emit('shareNewEntity', entity)
		);
		return entity;
	},
	

	itemAt: (name, position) => {
		let lootItemEntity = module.exports.item(name);
		let lootItemBody = entities.getComponent(lootItemEntity, "body");

		vec2.copy(
			lootItemBody.position,
			position
		);

		return lootItemEntity;
	},


	json: (item) => {
		let type = item.type;

		let entity = entities.create();

		//add components where special behavior is required
		entities.addComponent(entity, "physicsConfig");
		let physicsConfig = entities.getComponent(entity, "physicsConfig");

		//configure physics config
		Object.assign(physicsConfig, item.physicsConfig);

		entities.emitter.emit('bodyFrom' + physicsConfig.shapeType, entity);

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
		//note that type.name is used to fetch the color, not the type object.
		//that's because the object is indexed by the name of the type, not the info.
		let appearance = clientSideComponents.filter(c => c.name === "appearance")[0];
		appearance.object.color = appearance.object.color || colors[type.tier + "Tier"] || colors[type.name];

		return entity;
	},


	getJSON: (typeName) => {
		let type = JSON.parse(JSON.stringify(
			(typeof typeName === "string")
				? types.find(type => type.name === typeName)
				: typeName
		));

		//choose randomly from list
		replaceChooseFromListWithChoice(type);

		let item = {
			type: type,
			physicsConfig: {
				shapeConfig: {
					width: grabValue(type.size.width),
					height: grabValue(type.size.height),
					collisionGroup: type.collisionGroup
						? collisionGroups[type.collisionGroup]
						: collisionGroups.terrain
				},
				shapeType: "Box"
				//can't compute bodyConfig here because 
				//you need to know the shape values.
			}
		};

		if(type.collisionGroup === "groundBlocks") {
			item.physicsConfig.shapeConfig.collisionGroup = collisionGroups.groundBlocks;
			item.physicsConfig.shapeConfig.collisionMask = ~collisionGroups.groundBlocks;
		}

		item.physicsConfig.physical = (typeof type.physical === "undefined")
			? true
			: type.physical;

		//compute item.physicsConfig
		let sC = item.physicsConfig.shapeConfig;
		item.physicsConfig.bodyConfig = {
			mass: sC.width * sC.height * type.density,
			angle: type.randomAngle ? Math.random()*Math.PI*2 : 0
		};


		return item;
	}
};
