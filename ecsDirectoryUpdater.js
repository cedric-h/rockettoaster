//a tiny little dev tool to run alongside nodemon.
//it records the file structure of /src/ecs/ into a .json (ecsDirectory.json) whenever files there are added/removed.
//ecsDirectory.json is then used so the clientside game knows which files to grab.

//some requires/constants
const fs = require('fs');
const ECSPATH = './src/ecs/';
const subdirectories = fs.readdirSync(ECSPATH);

//initialize lastFiles to reflect the subdirectories.
//this is used to make sure we don't update the ecsDirectory.json needlessly.
let lastFiles = (function() { 
	let directory = {};
	subdirectories.forEach(subdirectory => directory[subdirectory] = []);
	return directory;
})();

//the actual watching
fs.watch(ECSPATH, {persistent: true, recursive: true}, (event, folderName) => {
	//if /com/ or /sys/ change,
	if(event === "change" && subdirectories.indexOf(folderName) !== -1)
		updateFolder(folderName);
});

//the function that actually updates ecsDirectory
function updateFolder(folderName) {
	fs.readdir(ECSPATH + "/" + folderName, (err, files) => {
		//filter out backup files and other stuff.
		files = files.filter(file => {
			let splitByDot = file.split('.');
			return splitByDot[splitByDot.length - 1] === 'js' && splitByDot.length < 3;
		});

		if(lastFiles[folderName] !== files) {
			//reset lastFiles, since we're right about to update the JSON
			lastFiles[folderName] = files;

			//actually finally update src/ecsDirectory.json
			//no harm in using sync functions since this program doesn't do anything else; no update loop to hang up
			let directoryObject = JSON.parse(fs.readFileSync('./src/ecsDirectory.json'));
			directoryObject[folderName] = files;
			fs.writeFileSync('./src/ecsDirectory.json',	JSON.stringify(directoryObject));
		}
	});
}
