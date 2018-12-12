const loadEcs = require('./loadEcs.js');
const ecslib  = require('./ecslib');
const wsWrapper = require('./websocketsWrapperClient');
const ecsDirectory = require('./ecsDirectory.json');

require('./style.css');

window.ecs = new ecslib.EntityComponentSystem();
window.entities = new ecslib.EntityPool();

window.camera = {
	position: [0, -5]
};

function startUpdateLoop() {
	console.log('connected!');

	//phew, done loading :D
	//clear loading screen
	document.body.innerHTML = "";
	server.emit('loaded');
	entities.emitter.emit('loaded');
	
	//update loop
	let lastTime;
	requestAnimationFrame(function update(time) {
		ecs.run(entities, lastTime ? (time - lastTime) / 1000 : 0);
		lastTime = time;
		requestAnimationFrame(update);
	});
}

//grab all of the modules listed in ecsDirectory.js
//and sort them according to whether they are sys or com.
new Promise(resolve => {
	let moduleTypes = {
		sys: [],
		com: []
	};

	Promise.all(
		Object.keys(ecsDirectory).map(folderName => 
			//find the appropriate moduleType and add the modules in this folder to it, once loaded.
			//there are a couple different folders for modules. sys and com are for the client only,
			//but ssys and scom are for modules shared with the server as well. in either case,
			//the last three letters indicate whether the modules inside are components or systems.
			new Promise(resolve => {
				Promise.all(
					ecsDirectory[folderName].map(name =>
						//can't just return the promise returned by the import
						//because we need to associate the name with the module 
						//inside of the promise import returns.
						new Promise(resolve => {
							import("./ecs/" + folderName + "/" + name).then(module => {
								module.name = name.split('.')[0];
								resolve(module);
							});
						})
					)
				).then(ecsModules => {
					moduleTypes[
						folderName.substring(folderName.length - 3, folderName.length)
					].push(...ecsModules);
					resolve();
				});
			})
		)
	).then(() => {
		resolve(moduleTypes)
	});
}).then(ecsModules => {
	console.log('whaddyaknow!');
	console.log(ecsModules);
	//let's get connected to the server.
	window.server = wsWrapper(new WebSocket("ws://" + window.location.hostname + ":3001"));

	loadEcs(
		ecsModules.sys,
		ecsModules.com
	).then(() => {
		console.log('ecs loaded');
		server.onopen = (server.readyState === 1) ? startUpdateLoop() : startUpdateLoop;
	});
});
