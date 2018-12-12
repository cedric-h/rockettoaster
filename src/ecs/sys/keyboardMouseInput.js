const worldConfig = require('../../gamedata/constants/worldConfig.json');
const {vec2} = require('../../p2.min.js');
var canvas;


const physicsCoords = vec2.create();
function getPhysicsCoords(event) {
	var rect = canvas.getBoundingClientRect();

	vec2.set(
		physicsCoords,
		(event.clientX - rect.left - canvas.width /2) /  worldConfig.zoom - camera.position[0],
		(event.clientY - rect.top  - canvas.height/2) / -worldConfig.zoom - camera.position[1]
	);

	return physicsCoords;
};


//I hope there is a hell just so I can go there for writing this code
//in my defense I was fairly tired writing it
const updateMovementAxis = event => {
	server.emit('inputUpdate', {
		"movementAxis": movementAxis.values = movementAxis.values.map((value, index) => {
			let direction = movementAxis.axes[index][event.key];
			return (direction === undefined) 
				? value
				: (event.type === "keydown")
					? Math.min(1, Math.max(-1, value + direction))
					: 0;
		})
	});
};
const movementAxis = {
	"values": [0, 0],
	"axes": [
		{
			"a": -1,
			"d":  1
		},
		{
			"s": -1,
			"w":  1
		}
	],
};
window.addEventListener("keydown", updateMovementAxis);
window.addEventListener("keyup", updateMovementAxis);


const handlePress = (event, inputsList, pressType, downType) => {
	let serverPacket = {};
	let input = inputsList[event[pressType]];

	if(input !== undefined) { 
		serverPacket[input.name] = [event.type === downType ? 1 : 0];

		if(input.sendAlsoMousePos) {
			let focalPoint = entities.getComponent(
				entities.find("cameraFocus")[0],
				"body"
			).position;
			let physicsCoords = getPhysicsCoords(event);
			vec2.sub(
				physicsCoords,
				physicsCoords,
				focalPoint
			);

			server.emit('inputUpdate', {
				"aimingAxis": physicsCoords
			});
		}

		server.emit('inputUpdate', serverPacket);
	}
}

entities.emitter.on('teamChosen', () => {
	canvas = document.getElementById("canvas");

	const handleMousePress = event => handlePress(event, [
		//0, left click
		{
			"name": "weaponTrigger",
			"sendAlsoMousePos": true
		}
	], "button", "mousedown");
	window.addEventListener("mousedown", handleMousePress);
	window.addEventListener("mouseup", handleMousePress);


	const handleKeyPress = event => handlePress(event, {
		"e": {
			"name": "pickUpButton",
		},
		"r": {
			"name": "dropButton",
		}
	}, "key", "keydown");
	window.addEventListener("keydown", handleKeyPress);
	window.addEventListener("keyup", handleKeyPress);
});
		

module.exports = [];
