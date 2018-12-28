const {vec2} = require("../../src/p2.min.js");


module.exports = {
    update: delta => {
        entities.find('chasing').forEach(chaserEntity => {
            let chasing = entities.getComponent(chaserEntity, 'chasing');

            let chaserPosition = entities.getComponent(chaserEntity, "body").position
            let closestClientDistance = chasing.minimumDistance ** 2;
            let closestClientEntity = undefined;

            entities.find('client').forEach(clientEntity => {
                let clientBody = entities.getComponent(clientEntity, "body");

            	if(clientBody !== undefined) {
					let clientPosition = entities.getComponent(clientEntity, "body").position;
	                let distance = vec2.squaredDistance(chaserPosition, clientPosition);

	                if (distance <= closestClientDistance) {
	                    closestClientDistance = distance;
	                    closestClientEntity = clientEntity;
	                }
	            }
            });

            if (closestClientEntity !== undefined) {
                let clientPosition = entities.getComponent(closestClientEntity, "body").position;

                let newChaserVelocity = vec2.create();
                vec2.subtract(
                    newChaserVelocity,
                    clientPosition,
                    chaserPosition
                );

                vec2.normalize(
                    newChaserVelocity,
                    newChaserVelocity
                );

                vec2.scale(
                    newChaserVelocity,
                    newChaserVelocity,
                    chasing.speed
                );

                let chaserPhysicsBody = entities.getComponent(chaserEntity, "body");

                vec2.copy(
                    chaserPhysicsBody.velocity,
                    newChaserVelocity
                );
            }
        });    
    }
};