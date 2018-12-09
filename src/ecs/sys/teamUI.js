//creates the UI that lets you pick a team, and then sends a message to the server when you pick one.
//also increments the team member counter.
entities.emitter.on('loaded', () => {
	["lime", "cyan"].forEach((color, index) => {
		let direction = ["left", "right"][index];
		let teamDiv = document.createElement("div");
		teamDiv.style.height = window.innerHeight + "px";
		teamDiv.style.width = "50%";
		teamDiv.style.position = "fixed";
		teamDiv.style[direction] = "0px";
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

			entities.emitter.emit('teamChosen');
			server.emit('teamChosen', {
				team: color
			});
		});

		document.body.prepend(teamDiv);

		server.once('playersInGameData', data => {
			let ourNumberOfPlayers = data[color];

			let div = document.createElement("div");
			let h1  = document.createElement("h1");
			h1.appendChild(document.createTextNode(ourNumberOfPlayers));
			div.appendChild(h1);
			div.appendChild(document.createTextNode(color + " players"));

			div.style["text-align"] = "center";
			div.style["font-size"] = "0.8em";
			div.style.width = "75px";
			div.style.position = "fixed";
			div.style.margin = "0px";
			div.style.top = "0px";
			div.style[direction] = "20px";
			div.style["z-index"] = 5;

			document.body.prepend(div);

			server.on('changeTeamCounter', data => {
				console.log('here');
				if(data.team === color)
					h1.innerText = parseInt(h1.innerText) + data.change;
			});
		});
	});
});

module.exports = {
};
