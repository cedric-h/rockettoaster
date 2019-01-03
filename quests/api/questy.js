/**
*  QuestyAPI:
*  Allows the user to create new quest objects with easily readable syntax.
*  @Author : Jake Wagoner
*/

module.exports = {
	// objects
	/**
	*  Object to save the target goal and the current progress
	*/
	Goal: function(ob) {
		this.goal = ob.goal || 10;
		this.current = ob.current || 0;
		this.ui = new q.GoalUI(this);
	},

	/**
	*  UI element for each goal object
	*/
	GoalUI: function(goal) {
		let g,t;

		/**
		*  Private method to create the element for the goal
		*/
		const createGoalElement = function() {
			g = document.createElement("P");
			t = document.createTextNode(`${goal.current} out of ${goal.goal}`);
			g.appendChild(t);
		}

		/**
		*  Public method to append the goal to the container
		*/
		this.appendGoal = function(containerID) {
			document.getElementById(containerID).appendChild(g);
		}

		/**
		*  Public method to update the text of the element
		*/
		this.updateText = function(text) {
			g.innerHTML = text || `${goal.current} out of ${goal.goal}`;
		}

		createGoalElement();
	},

	/**
	*  Main quest object that stores and utilizes data from the user
	*/
	Quest: function(ob) {
		this.questName = ob.questName || "Missing Quest Name";
		this.description = ob.description || "Missing description";
		this.goals = ob.goals || []; // An array of goal objects

		this.ui = {
			// html output console's id
			containerID: "console",
			// a little hacky but this generates a random string of charaters for the id of the quest's div
			ID: Math.random().toString(36).substring(5)
		}

		/**
		*  Initialize the object
		*/
		const init = () => {
			initUI();

			for(let i = 0; i < this.goals.length; i++) {
				this.goals[i].ui.appendGoal(this.ui.ID);
			}
		}

		/**
		*  Initialize the UI of the object, as in create the element in the console
		*/
		const initUI = () => {
			let q = document.createElement("DIV");
			let qName = document.createElement("H3");
			let desc = document.createElement("SPAN");
			q.setAttribute("id",this.ui.ID);
			let t = document.createTextNode(this.description);
			let qN = document.createTextNode(this.questName);
			qName.appendChild(qN);
			desc.appendChild(t);

			q.appendChild(qName);
			q.appendChild(desc);
			document.getElementById(this.ui.containerID).appendChild(q);
		}

		/** 
		*  Progress a goal by a certain amount
		*/
		this.progress = function(goal, amount) {
			if (goal.current + amount <= goal.goal) {
				goal.current += amount;
			}

			if (goal.current >= goal.goal) {
				this.complete(goal);
				return;
			}

			goal.ui.updateText();
		}

		/**
		*  Updates goal descriptions when quest is completed
		*/
		this.complete = function(goal) {
			// TODO: update UI to display "completed, ready to turn in."
			goal.ui.updateText("Completed");
		}

		/**
		*  Turns in and completes the quest
		*/
		this.turnIn = function() {
			// TODO: distribute rewards
			if (this.goals.every(goalIsComplete)) {
				document.getElementById(this.ui.ID).parentNode.removeChild(document.getElementById(this.ui.ID));
			}
		}

		const goalIsComplete = (goal) => {
			return goal.current === goal.goal;
		}

		init();
	},

	// methods
	/**
	*  Finds and returns the NPC object by name
	*/
	getNPC: function(name) {
		// get npc by name
	},
}