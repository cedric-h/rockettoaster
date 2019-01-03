/**
* This file is an example of how to create a quest using the Questy api.
* Every quest must have a description and "list" of goal objects previously made.
* This will append the Quest's description and goals to the console with the id "console".
* When a quest is turned into the NPC, call questName.turnIn();
* @Author : Jake Wagoner
*/

const Questy = require("./api/questy.js");


let goalName1 = new Questy.Goal({
	goal: 10,
	current: 0
});

let goalName2 = new Questy.Goal({
	goal: 50,
	current: 0
});

let questName = new Questy.Quest({
	description: "This quest is an example...",
	goals: [
		goalName1,
		goalName2
	]
});