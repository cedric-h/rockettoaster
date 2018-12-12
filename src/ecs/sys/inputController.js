var interval;
var controllerState;
const inputEvents = [];

entities.emitter.on('teamChosen', () => {
	if(!('ongamepadconnected' in window)) {
		// No gamepad events available, poll instead.
		interval = setInterval(pollGamepads, 500);
	}
});

//https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length != b.length) return false;

	// If you don't care about the order of the elements inside
	// the array, you should sort both arrays here.
	// Please note that calling sort on an array will modify that array.
	// you might want to clone your array first.

	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

function sendInput(watchedInput, serverUpdatePacket, inputEvents) {
	if(watchedInput.sendAlso) {
		if(!serverUpdatePacket.sendAlso)
			serverUpdatePacket.sendAlso = [];

		serverUpdatePacket.sendAlso.push({
			"name": watchedInput.sendAlso,
			"sentFor": watchedInput.name,
			"value": controllerState.filter(input =>
				input.name == watchedInput.sendAlso
			)[0].value
		});
	}

	//let server know
	if(watchedInput.emitServer)
		serverUpdatePacket[watchedInput.name] = watchedInput.value;

	//let other local scripts know, if they're supposed to.
	//we have to do this after we send the info to the server,
	//so it doesn't pass by reference and change the input
	//right before we send it (that would be bad)
	//so that's why the inputEvents array is here.
	if(watchedInput.emitEvent)
		inputEvents.push([
			watchedInput.name + "Input",
			watchedInput.value
		]);
}

function pollGamepads() {
	Array.from( navigator.getGamepads())
		.filter(gp => gp !== null)
		.forEach(gamepad => {
			controllerState = [
				{
					name: "movementAxis",
					value: [0, 0],
					indexes: [0, 1], //where in the array of axes it is.
					type: "axes",
					deadZone: 0.15,
					emitEvent: true,
					emitServer: true
				},
				{
					name: "weaponTrigger",
					value: [0],
					indexes: [7],
					type: "buttons",
					emitServer: true,
				},
				{
					name: "aimingAxis",
					value: [0, 0],
					indexes: [2, 3],
					type: "axes",
					emitServer: true
				},
				{
					name: "pickUpButton",
					value: [0],
					indexes: [0],
					type: "buttons",
					emitServer: true
				},
				{
					name: "dropButton",
					value: [0],
					indexes: [2],
					type: "buttons",
					emitServer: true
				}
			];
			console.log('controller connected!');
			clearInterval(interval);
		});
}

const bannedName = "Unknown Controller";

module.exports = {
	update: () => {
		let gamepads = Array.from(navigator.getGamepads())
			.filter(gp => gp !== null)
			.filter(gp => gp.id.substring(0, bannedName.length - 1) !== bannedName);
		//console.log(gamepads);
		
		if(gamepads.length > 0) {
			gamepads.forEach(gp => {

				if(typeof gp !== "undefined" && controllerState !== undefined) {
					let serverUpdatePacket = {};

					controllerState.forEach(watchedInput => {
						let inputValue = watchedInput.indexes
							//grab the values
							.map(index => gp[watchedInput.type][index])
							//if the value's in an object, pull it out.
							.map(value => (typeof value.value !== "undefined")
								? value.value
								: value
							)
							//apply deadZones.
							.map(value => (Math.abs(value) < watchedInput.deadZone)
								? 0
								: value
							);

						//for some reason Y values are flipped, let's fix that
						if(watchedInput.type === "axes")
							inputValue[1] *= -1;

						if(!arraysEqual(inputValue, watchedInput.value)) {
							//record new value
							watchedInput.value = inputValue;
							
							sendInput(watchedInput, serverUpdatePacket, inputEvents);
						}
					});

					if(Object.keys(serverUpdatePacket).length > 0) {
						//boop them bad bois over to the server
						server.emit('inputUpdate', serverUpdatePacket);

						//send each event, then delete the event.
						inputEvents.filter(event => {
							entities.emitter.emit(
								event[0],
								event[1],
								entities.find('localPlayer')[0]
							);
							return false;
						});
					}
				}
			});
		}
	}
};
