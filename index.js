//ECS lib classes
const ecslib = require('./src/ecslib');
global.ecs = new ecslib.EntityComponentSystem();
global.entities = new ecslib.EntityPool();

//file system
const fs = require('fs-extra');

//server and client module that loads external ECS files
const loadEcs = require('./src/loadEcs');

//precision time for the update loop.
let present = require('present');

//error handling
process.on('unhandledRejection', err => {
	console.error(err);
});


//ecs directories the server should know about and possibly pull from.
let directoriesToGet = [
	'./ecs/sys',
	'./ecs/com',
	//these are files in the client ECS folders
	//that are designed to work with the server as well
	//as the client; the s stands for server.
	//the client also has normal /com and /sys directories.
	//those are for the client only.
	'./src/ecs/ssys',
	'./src/ecs/scom'
];

//ECS loading
Promise.all(directoriesToGet.map(x => fs.readdir(x))).then((folders) => {
	//filter out vim's .swp backup files.
	folders = folders.map(folder => 
		folder.filter(fileName =>
			fileName.split('.')[fileName.split('.').length - 1] === "js"
		)
	);

	folders.forEach((folder, folderIndex) => {
		folder.forEach((fileName, fileIndex) => {
			//use a try/catch to handle the module if it's not server compatible.
			folder[fileIndex] = require(directoriesToGet[folderIndex] + '/' + fileName);

			folder[fileIndex].name = fileName.split('.')[0];
		});
	});
	
	//passing it to loadEcs
	loadEcs(
		folders[0].concat(folders[2]), //systems
		folders[1].concat(folders[3]), //components
	).then(afterEcsLoad);
});

//once the ./components and ./systems files are loaded, fire up the update loop.
function afterEcsLoad() {
	//this event is part of the loading pipeline,
	//a lot of scripts listen to this.
	entities.emitter.emit('loaded');

	//update loop
	let lastTime = present();
	setInterval(() => {
		ecs.run(entities, (present() - lastTime) / 1000);

		lastTime = present();
	}, 1000/30);
}
