module.exports = (messageType, packet) => {
	entities.find('client').forEach(clientEntity =>
		entities.getComponent(clientEntity, "client").send(messageType, packet)
	);
};
