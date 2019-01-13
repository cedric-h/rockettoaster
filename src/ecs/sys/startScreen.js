//creates the UI that lets you pick a team, and then sends a message to the server when you pick one.
//also increments the team member counter.

entities.emitter.on('loaded', () => {


		let screenCoverDiv = document.createElement("div");
		screenCoverDiv.style.height = window.innerHeight + "px";
		screenCoverDiv.style.width = "100%";
		screenCoverDiv.style.height = "100%";
		screenCoverDiv.style.position = "fixed";
		screenCoverDiv.style.left = "0px";
		screenCoverDiv.style["z-index"] = 3;
		screenCoverDiv.style.opacity = 0.2;
		screenCoverDiv.style["background-color"] = "cyan";
		screenCoverDiv.className = "screenCoverDiv";
		
		screenCoverDiv.addEventListener('mouseover', () => {
			screenCoverDiv.style.opacity = 0.4;
		});
		screenCoverDiv.addEventListener('mouseout', () => {
			screenCoverDiv.style.opacity = 0.2;
		});

		screenCoverDiv.addEventListener('click', () => {
			document.body.removeChild(screenCoverDiv);

			entities.emitter.emit('gameJoined');
			server.emit('gameJoined');
		});

		document.body.prepend(screenCoverDiv);
});

module.exports = {
};
