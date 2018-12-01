//a tiny little dev tool to run alongside nodemon.
//it records the file structure of /src/ecs/ into a .json (ecsDirectory.json) whenever files there are added/removed.
//ecsDirectory.json is then used so the clientside game knows which files to grab.

//some requires/constants
const fs = require('fs');
const ECSPATH = './src/ecs/';

//this variable is used to make sure we don't update the ecsDirectory.json needlessly.
//so let's initialize it to reflect the subdirectories.
let lastFiles = (function() { 
	let directory = {};
	fs.readdirSync(ECSPATH).forEach(subdirectory => directory[subdirectory] = []);
	return directory;
})();
//then we'll call updateFolders to fill those empty subdirectories.
updateFolders();

//then, we'll call updateFolders again if any of the files change.
fs.watch(ECSPATH, {persistent: true, recursive: true}, (event, folderName) => {
	//if any of the files in ECSPATH change,
	if(event === "change")
		updateFolders();
});

//the function that actually updates ecsDirectory
function updateFolders() {
	fs.readdirSync(ECSPATH).forEach(folderName => {
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
	});
}
