const {chunkSize} = require('../src/gamedata/constants/worldConfig.json');

module.exports = xPosition => {
	return Math.floor(xPosition/chunkSize);
}
