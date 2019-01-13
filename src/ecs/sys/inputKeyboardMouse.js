const requireAll = r => r.keys().map(r);

const worldConfig = require('../../gamedata/constants/worldConfig.json');
const {vec2} = require('../../p2.min.js');
const inputs = {
	buttons: requireAll(require.context('./../../gamedata/constants/input/buttons/', true, /\.json$/)),
	movementAxis: require('../../gamedata/constants/input/movementAxis.json'),
	mouse: require('../../gamedata/constants/input/mouse.json')
};
console.log(inputs);

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


function sendAim(event) {
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


const updateMovementAxis = event => {
	let movementAxis = inputs.movementAxis;
	let key = movementAxis.keys[event.key];
	
	if(key !== undefined) {
		movementAxis.values[key.direction] = (event.type === "keydown") ? key.coefficient : 0;

		server.emit('inputUpdate',{
			"movementAxis": movementAxis.values
		});

		entities.emitter.emit(
			'movementAxisInput',
			movementAxis.values.slice(0),//clone so it doesn't effect the copy we ship to the server.
			entities.find('cameraFocus')[0]
		);
	}
};


const handlePress = (event, inputsList, pressType, downType) => {
	let serverPacket = {};
	let input = inputsList[event[pressType]];

	if(input !== undefined) { 
		serverPacket[input.name] = [event.type === downType ? 1 : 0];

		if(input.sendAlsoMousePos)
			sendAim(event);

		server.emit('inputUpdate', serverPacket);
	}
}

entities.emitter.on('gameJoined', () => {
	canvas = document.getElementById("canvas");

	const handleMousePress = event => handlePress(event, inputs.mouse, "button", "mousedown");
	window.addEventListener("mousedown", handleMousePress);
	window.addEventListener("mouseup", handleMousePress);
	window.addEventListener("mousemove", sendAim);


	const handleKeyPress = event => inputs.buttons.forEach(buttonSet =>
		handlePress(event, buttonSet, "key", "keydown")
	);
	window.addEventListener("keydown", handleKeyPress);
	window.addEventListener("keyup", handleKeyPress);

	window.addEventListener("keydown", updateMovementAxis);
	window.addEventListener("keyup", updateMovementAxis);
});
		

module.exports = [];
