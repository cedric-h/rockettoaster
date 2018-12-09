entities.emitter.on('clientCreate', entity => {
	let client = entities.getComponent(entity, "client");

	client.on("inputUpdate", input => {
		Object.keys(input).forEach(key => {
			let sendAlso = (input.sendAlso) ? input.sendAlso.filter(sendAlso =>
				sendAlso.sentFor === key
			) : [];

			if(sendAlso.length === 0)
				entities.emitter.emit(key + "Input", input[key], entity);

			else {
				sendAlso.push({
					name: key,
					value: input[key]
				});
				entities.emitter.emit(
					key + "Input",
					sendAlso,
					entity
				);
			}
		});
	});
});

module.exports = {
};
