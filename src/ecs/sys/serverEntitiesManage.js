//this script adds entities when the server tells the clients to do so.
//it doesn't add them immediately, though, if they're super far away.
//it also sweeps them away if they're pretty far behind us.
const addComponentsList = require('../../helper/addComponentsList.js');
const {chunkSize} = require('../../gamedata/constants/worldConfig.json');


const chunks = {};
const serverIdCurrentChunkMap = {};
const chunkRange = 2;
let playerChunkTimeout = undefined;


//some helper functions
function addComponents(entity, components) {
	addComponentsList(entity, components);

	//emit an event on each component added,
	//in case any special logic needs to be called.
	components.forEach(component => {
		//in case anything special needs to happen to this component.
		//that might interfere with the Object.assign, but they can
		//just reset that.
		entities.emitter.emit(component.name + "AddedFromServer", entity);
	});
}

function isCloseChunk(chunk, cameraChunk) {
	return (chunk <= cameraChunk + chunkRange && chunk >= cameraChunk - chunkRange);
}

function addEntityFromChunkLoader(componentsList) {
	let entity = entities.create();

	//in case any special code needs to be run to get these guys up to speed.
	componentsList.forEach(component => {
		entities.emitter.emit(component.name + 'AddedFromChunkLoader', entity);
	});
	addComponents(entity, componentsList);
}

function getChunk(xPosition) {
	return Math.floor(xPosition/chunkSize);
}

function entityWithServerId(id) {
	return entities.find('serverId').find(entity =>
			entities.getComponent(entity, "serverId") == id
		);
}


/*
function updateChunkIfShould(serverId, newPos) {
	let chunkPos = getChunk(newPos);

	//if they've moved,
	if(chunks[serverId] !== chunkPos) {
		//get their backup data moved to another chunk,
		
		entities.emitter.emit('serverIdMovedChunk', serverId, chunkPos, chunks[serverId]);

		//and record the chunk they've moved to so you can tell if they move again.
		chunks[serverId] = chunkPos;
	}
}*/

function queueUpdatingPlayerChunks() {
	//console.log('queueing player chunk move');

	if(playerChunkTimeout !== undefined)
		clearTimeout(playerChunkTimeout);

	playerChunkTimeout = setTimeout(() => {
		updatePlayerChunks();
		playerChunkTimeout = undefined;
	}, 100);
};

function updatePlayerChunks() {
	let cameraChunkI = getChunk(
		entities.getComponent(entities.find('cameraFocus')[0], "body").position[0]
	);

	for(let chunkI in chunks) {
		let chunk = chunks[chunkI];

		//this chunk is worth having, soo
		if(isCloseChunk(chunkI, cameraChunkI)) {
			
			//and it's not loaded yet!
			if(!chunk.isLoaded) {
				//console.log('loading the chunk the player is under, ' + chunkI + ' is true');

				//make each entity exist.
				for(let serverId in chunk.entities)
					addEntityFromChunkLoader(chunk.entities[serverId]);

				chunk.isLoaded = true;
			}

			//else
				//console.log('the chunk the player is under is already loaded :D');
		}

		//this chunk isn't and it's loaded.
		else if(chunk.isLoaded) {
			//console.log("deleting a chunk he isn't under, apparently " + chunkI + " is true.");

			//destroy each already existing entity.
			for(let serverId in chunk.entities) {
				let entity = entityWithServerId(serverId);

				chunk.entities[serverId].forEach(component => {
					entities.emitter.emit(
						component.name + 'UnloadedFromChunk',
						component,
						entity
					);
				});
				entities.destroy(entity);
			};

			chunk.isLoaded = false;
		}
	}
}

function moveChunks(serverId, newChunkI, oldChunkI) {
	let cameraFocusEntity = entities.find('cameraFocus')[0];

	//if it's the player that moved chunks, let's update which chunks are loaded.
	if(cameraFocusEntity !== undefined && entities.getComponent(cameraFocusEntity, "serverId") === serverId) {
		queueUpdatingPlayerChunks();

		serverIdCurrentChunkMap[serverId] = newChunkI;
	}

	//if it's a rock or something that moved chunks, let's just update their chunk register.
	else {
		//if we don't know what chunk they started in, or the chunk they started in doesn't seem to contain them,
		//we'll have to search each chunk until we can find them.
		let oldChunk = chunks[oldChunkI];
		let newChunk = chunks[newChunkI];

		if(oldChunk.entities[serverId] !== undefined) {
			//remove them from the old chunk
			newChunk.entities[serverId] = oldChunk.entities[serverId];
			//add them to the new chunk
			delete oldChunk.entities[serverId];
			//save their new chunk in the map,
			//so we can use it as a reference point to see if their chunk changed.
			serverIdCurrentChunkMap[serverId] = newChunkI;

			
			//grab the camera chunk so we can see if it moved to where it is.
			let cameraChunkI = typeof cameraFocusEntity !== "undefined"
				? getChunk(entities.getComponent(cameraFocusEntity, "body").position[0])
				: 0;
			
			//since it moved chunks, destroy it if it moved out of the valid range of chunks.
			if(!isCloseChunk(newChunkI, cameraChunkI) && entityWithServerId(serverId) !== undefined) {
				let entity = entityWithServerId(serverId);
				//in case any functions need to be ran to prepare it for reloading later.
				newChunk.entities[serverId].forEach(component => {
					entities.emitter.emit(
						component.name + 'UnloadedFromChunk',
						component,
						entity
					);
				});
				entities.destroy(entity);
				//console.log('removed an entity because it moved out of the loaded chunks.');
			}

			//if they've moved in to the chunk the player's in, spawn them!
			//because it could have slid in from a chunk that wasn't spawned in
			//to a chunk that is. but make sure they don't already exist.

			else if(typeof entityWithServerId(serverId) === "undefined"){
				addEntityFromChunkLoader(newChunk.entities[serverId]);
				//console.log(entityWithServerId(serverId));
				//console.log("should add entity which didn't already exist in the chunk it moved to.");
			}
		}

		//else
			//alert("couldn't find the entity to move to the new chunk.");
	}
}


entities.emitter.on('loaded', () => {

	server.on('physics', megapacket => {

		//loop over all entities with serverIds
		entities.find('serverId').forEach(entity => {

			let id = entities.getComponent(entity, "serverId");

			if(megapacket[id]) {
				let body = entities.getComponent(entity, "body");
				let oldChunkI = serverIdCurrentChunkMap[id];
				let newChunkI = getChunk(body.position[0]);

				if(oldChunkI != newChunkI)
					moveChunks(id, newChunkI, oldChunkI);
			}
		});
	});
	
	server.on('newEntity', components => {
		let physicsConfig = components.find(c => c.name === "physicsConfig");
		let serverId = components.find(c => c.name === "serverId");
		let cameraFocusEntity = entities.find('cameraFocus')[0];

		if(serverId !== undefined)
			serverId = serverId.value;

		//if the new entity we're getting is our camera focus, let's start using his position
		//instead of just the 0, 0 the start screen points at.
		if(components.some(component => component.name === "cameraFocus")) {
			console.log('and now we have our camera focus, boys and girls!');
		}

		//if it's not in a nearby chunk, save it until it is.
		//it's only worth saving things in chunks if they're physical and
		//the server is going to be referencing them again in the future.
		else if(physicsConfig && serverId !== undefined) {
			let newEntityChunk = getChunk(physicsConfig.object.bodyConfig.position[0]);
			let cameraChunk = (cameraFocusEntity)
				? getChunk(entities.getComponent(cameraFocusEntity, "body").position[0])
				: 0;


			//if we haven't added the chunk this thing is in yet,
			if(!chunks[newEntityChunk])
				chunks[newEntityChunk] = {
					entities: {},
					isLoaded: false
				};

			//they're saved indexed by their serverId in an object indexed by the number of the chunk they're in.
			chunks[newEntityChunk].entities[serverId] = components;

			//which chunk their serverId is in is also saved somewhere else so we don't have to keep looking it up.
			serverIdCurrentChunkMap[serverId] = newEntityChunk;
			
			//it's not nearby, so let's not add it to the game yet, instead let's save it for later.
			if(!isCloseChunk(newEntityChunk, cameraChunk))
				return;

			else
				chunks[newEntityChunk].isLoaded = true;
		}

		let entity = entities.create();
		addComponents(entity, components);
	});

	server.on('addComponents', data => {
		let entity = entityWithServerId(data.serverId);
		addComponents(entity, data.components);
	});

	server.on('destroyEntity', toBeDestroyedServerId => {
		//remove from the backup
		for(chunkI in chunks) {
			for(serverId in chunks[chunkI].entities) {
				if(serverId == toBeDestroyedServerId) {
					delete chunks[chunkI].entities[serverId];
				}
			}
		}
		
		if(toBeDestroyedServerId !== undefined) {
			let entity = entityWithServerId(toBeDestroyedServerId);
			if(entity !== undefined) { 
				entities.destroy(entity);
			}
		}
	});
});

module.exports = {
}
