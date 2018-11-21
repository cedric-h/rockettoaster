const loadEcs = require('./loadEcs.js');
const ecslib  = require('./ecslib');
const wsWrapper = require('./websocketsWrapperClient');
const ecsDirectory = require('./ecsDirectory.json');

require('./style.css');

window.ecs = new ecslib.EntityComponentSystem();
window.entities = new ecslib.EntityPool();

window.camera = {
	position: [0, 5]
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

//load all of the modules in ecsDirectory.js
Promise.all(
	Object.keys(ecsDirectory).map(folderName =>
		Promise.all(ecsDirectory[folderName].map(name =>
			//can't just return the promise returned by the import
			//because we need to associate the name with the module 
			//inside of the promise import returns.
			new Promise(resolve => {
				console.log('inside of loading promise. for a ' + folderName + " named " + name);
				import("./ecs/" + folderName + "/" + name).then(module => {
					module.name = name.split('.')[0];
					console.log('actually resolving that promise. for a ' + folderName + " named " + name);
					resolve(module);
				});
			})
		))
	)
).then(folders => {
	console.log('whaddyaknow!');
	//let's get connected to the server.
	window.server = wsWrapper(new WebSocket("ws://" + window.location.hostname + ":8080"));

	loadEcs(...folders).then(() => {
		server.onopen = (server.readyState === 1) ? startUpdateLoop() : startUpdateLoop;
	});
});
