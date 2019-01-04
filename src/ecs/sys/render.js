const p2 = require('../../p2.min.js');
const colors = require('../../gamedata/constants/colors.json');
const worldConfig = require('../../gamedata/constants/worldConfig.json');

var appearances = [];
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
	canvas.id = "canvas";
	ctx = canvas.getContext('2d');

	//put that canvas on the screen.
	document.body.append(canvas);
	
	//make sure the canvas stays the right size
	resize();
	window.addEventListener('resize', resize);
});

//We need to sort the appearances array by zIndex so that trees and clouds
//appear over everything else, but that's an expensive sort to do.
//since things are often spawned all at once, we wait a bit to see
//if anything else will be spawned first. If nothing is, we add 'em in.
var sortTimeout;
entities.emitter.on('appearanceCreate', entity => {
	let zIndex = entities.getComponent(entity, "appearance").zIndex;

	appearances[zIndex === 0 ? "unshift" : "push"](entity);

	clearTimeout(sortTimeout);
	sortTimeout = setTimeout(
		() => {
			appearances = appearances.sort((a, b) => 
				entities.getComponent(a, "appearance").zIndex - entities.getComponent(b, "appearance").zIndex
			);
		},
		15
	);
});

entities.emitter.on('appearanceRemove', entity => {
	appearances.splice(appearances.indexOf(entity), 1);
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
		ctx.scale(worldConfig.zoom, -worldConfig.zoom);

		ctx.translate(camera.position[0], camera.position[1]);

		//render the game's two different skies.
		ctx.fillStyle = colors.underground;
		ctx.fillRect(worldConfig.size/-2, 0, worldConfig.size, -60);
		
		ctx.fillStyle = colors.ground;
		ctx.fillRect(worldConfig.size/-2, worldConfig.floorHeight, worldConfig.size, -60);

		//great, now render each and every rectangle.
		appearances.forEach(entity => {
			let physicsConfig = entities.getComponent(entity, "physicsConfig");
			let appearance = entities.getComponent(entity, "appearance");

			ctx.globalAlpha = (appearance.transparency !== undefined)
				? appearance.transparency
				: 1;

			if(physicsConfig !== undefined) {
				ctx.fillStyle = appearance.color;
				drawRectangle(physicsConfig.body, physicsConfig.shapeConfig);
			}

			else if(appearance.type === "line") {
				ctx.strokeStyle = appearance.color;
				ctx.lineWidth = appearance.lineWidth;
				//can't use ...appearance.coords[0] because float32 arrays aren't iterable
				ctx.beginPath();
				ctx.moveTo(appearance.coords[0][0], appearance.coords[0][1]);
				ctx.lineTo(appearance.coords[1][0], appearance.coords[1][1]);
				ctx.stroke();
			}
		});

		ctx.restore();
	}
};
