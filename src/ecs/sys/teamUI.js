//creates the UI that lets you pick a team, and then sends a message to the server when you pick one.
//also increments the team member counter.
entities.emitter.on('loaded', () => {
	["lime", "cyan"].forEach((color, index) => {
		let teamDiv = document.createElement("div");
		teamDiv.style.height = window.innerHeight + "px";
		teamDiv.style.width = "50%";
		teamDiv.style.position = "fixed";
		teamDiv.style[["left", "right"][index]] = "0px";
		teamDiv.style["z-index"] = 3;
		teamDiv.style.opacity = 0.2;
		teamDiv.style["background-color"] = color;
		teamDiv.className = "teamDiv";
		
		teamDiv.addEventListener('mouseover', () => {
			teamDiv.style.opacity = 0.4;
		});
		teamDiv.addEventListener('mouseout', () => {
			teamDiv.style.opacity = 0.2;
		});

		teamDiv.addEventListener('click', () => {
			Array.from(document.getElementsByClassName('teamDiv')).forEach(teamDiv =>
				document.body.removeChild(teamDiv)
			);

			server.emit('teamChosen', {
				team: color
			});
		});

		document.body.prepend(teamDiv);
	});
});

module.exports = {
};
