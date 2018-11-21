const p2 = require('../../p2.min.js');
const colors = require('../../gamedata/constants/colors.json');

var canvas, ctx;

function resize() {
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
}

function drawRectangle(body, shape) {
	ctx.save();

	ctx.translate(body.interpolatedPosition[0], body.interpolatedPosition[1]);
	ctx.rotate(body.interpolatedAngle);

	ctx.fillRect(
		-shape.width/2,
		-shape.height/2,
		shape.width,
		shape.height
	);

	ctx.restore();
}



entities.emitter.on('loaded', () => {
	//grab our canvas and ctx variables.
	canvas = document.createElement("canvas");
	ctx = canvas.getContext('2d');

	//put that canvas on the screen.
	document.body.append(canvas);
	
	//make sure the canvas stays the right size
	resize();
	window.addEventListener('resize', resize);
});


module.exports = {
	update: () => {
		//background
		ctx.fillStyle = colors.sky;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		//move the camera towards the cameraFocus.
		let cameraFocusEntity = entities.find('cameraFocus')[0];
		if(cameraFocusEntity !== undefined) {
			let cameraFocus = entities.getComponent(cameraFocusEntity, "body");
			p2.vec2.lerp(
				camera.position,
				camera.position,
				[-cameraFocus.position[0], -cameraFocus.position[1]],
				0.05
			);
		}

		ctx.save();

		//get the camera situated.
		ctx.translate(canvas.width/2, canvas.height/2);
		ctx.scale(50, -50);

		ctx.translate(camera.position[0], camera.position[1]);
		
		ctx.fillStyle = colors.ground;
		ctx.fillRect(-100, 0, 200, -10);

		//great, now render each and every rectangle.
		entities.find('appearance').forEach(entity => {
			let body       = entities.getComponent(entity, "body");
			let appearance = entities.getComponent(entity, "appearance");

			body.shapes.forEach(shape => {
				ctx.fillStyle = appearance.color;
				drawRectangle(body, shape);
			});
		});

		ctx.restore();
	}
};
