//ECS lib classes
const ecslib = require('./src/ecslib');
global.ecs = new ecslib.EntityComponentSystem();
global.entities = new ecslib.EntityPool();

//file system
const path = require('path');
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
	'./src/ecs/sys',
	'./src/ecs/com'
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
			let file = fs.readFileSync(
				directoriesToGet[folderIndex] + '/' + fileName,
				"utf8",
			);
			file.split('\n').forEach(line => {
				console.log('hi, ' + line);
			});

			try {

				//console.log(directoriesToGet[folderIndex] + '/' + fileName);
				folder[fileIndex] = require(directoriesToGet[folderIndex] + '/' + fileName);
				
				folder[fileIndex].name = fileName.split('.')[0];

				//if it's stored in the client ecs folder but meant for the server too...
				if(folder[fileIndex].serverCompatible)
					folders[folderIndex - 2].push(folder[fileIndex]);
			}

			catch(error) {
				//if the cause of the error was simply that the module in question wasn't server compatible,
				//log that and move on.
				//but I do that in a dumb way, I should just grep the file for "serverCompatible: true"
				if(error.name === "ReferenceError"/* && error.message === "define is not defined"*/)
					{}//do literally nothing, this file wasn't designed for the server.

				//however, if it was a legitimate error in a file was designed to run on the server,
				//throw the error so that it pops up in the console, that way it can be debugged.
				else
					throw error;
			}
		});
	});
	
	//passing it to loadEcs
	loadEcs(
		folders[0], //systems
		folders[1], //components
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
	}, 1000/60);
}
