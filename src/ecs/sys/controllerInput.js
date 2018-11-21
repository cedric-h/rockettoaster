var interval;
var controllerState;

if(!('ongamepadconnected' in window)) {
	// No gamepad events available, poll instead.
	interval = setInterval(pollGamepads, 500);
}

function vec2sEqual(a, b) {
	return a[0] === b[0] && a[1] === b[1];
}

function pollGamepads() {
	var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
	if(gamepads[0]) {
		controllerState = [
			{
				name: "movementAxis",
				value: [0, 0],
				indexes: [0, 1], //where in the array of axes it is.
				type: "axes",
			}
		];
		console.log('controlled connected!');
		clearInterval(interval);
	}
}

module.exports = {
	update: () => {
		if(controllerState !== undefined) {
			let gp = navigator.getGamepads()[0];
			let serverUpdatePacket = {};

			controllerState.forEach(watchedInput => {
				let inputValue = watchedInput.indexes.map((index) => gp.axes[index]);

				if(!vec2sEqual(inputValue, watchedInput.value)) {
					watchedInput.value = inputValue;
					serverUpdatePacket[watchedInput.name] = inputValue;
				}
			});

			if(Object.keys(serverUpdatePacket).length > 0)
				server.emit('inputUpdate', serverUpdatePacket);
		}
	}
};
