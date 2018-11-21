//you can't just serialize the entire body; they're recursive (and big).
const validKeys = ["interpolatedPosition", "velocity", "interpolatedAngle"];

setInterval(() => {

	//megapacket will contain orientation/velocity data for each physics object.
	let megapacket = {};
	
	entities.find('body').forEach(entity => {
		let body = entities.getComponent(entity, "body");

		if(body.sleepState === 0) {
			//indexed by id so the clients know who exactly the information is for.
			megapacket[entity] = {};

			//add the relevant fields to the body's field in the megapacket.
			validKeys.forEach(key => {
				let packetKey = key;

				if(key.substring(0, 12) === "interpolated")
					packetKey = key.substring(12, key.length).toLowerCase();

				megapacket[entity][packetKey] = body[key];
			});
		}
	});

	entities.find('client').forEach(entity => {
		entities.getComponent(entity, "client").send("physics", megapacket);
	});
}, 1000/10);

module.exports = {
}
