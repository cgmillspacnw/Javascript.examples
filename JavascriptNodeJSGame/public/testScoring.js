/**
 * @author craig.mills
 * From a framework provided by Charlie
 * PROG 282  Week 04 Assignment: Draw Grid with Test table logic
 */
/*jshint jquery:true, browser: true */


CGMApp.own.testScoring = (function() {

	var myCharacter = null;
	var myFoe = null;
	
	// Constructor...
	function testScoring() {
		//this.getCharacter();
		//this.getFoe();
		$('#testStrikeButton').click( testStrike);
	}

/*
	var displayCharacterTable = function() {
		// re-write the entire table
		$("#heroTable").empty();
		$("#heroTable").html("<tr><th>Stat</th><th>Value</th></tr>");
		for ( var value in myCharacter) {
			var a = value;
	        var b = myCharacter[value];
			var data = "<tr><td class='trait'>" + a + "</td>" + "<td>" + b + "</td></tr>";
	        $("#heroTable").append(data); 
		};
	};
	
	var displayFoeTable = function() {
		// re-write the entire table
		$("#foeTable").empty();
		$("#foeTable").html("<tr><th>Stat</th><th>Value</th></tr>");
		for ( var value in myFoe) {
			var a = value;
	        var b = myFoe[value];
			var data = "<tr><td class='trait'>" + a + "</td>" + "<td>" + b + "</td></tr>";
	        $("#foeTable").append(data); 
		};
	};
*/	

	var testStrike = function() {
		// Generate a number from 1 to 100
		var baseStrike = Math.floor((Math.random() * 100) + 1);
		var myBonus = parseInt(CGMApp.run.characters.Hero.Experience) 
			+ parseInt(CGMApp.run.characters.Hero.Strength);
		var resultString = "Bonus " + myBonus.toString() + ", Roll " + baseStrike.toString() + " -- ";
		
		var myHero = CGMApp.run.characters.Hero;
		var myFoe = CGMApp.run.characters.Orc;
		
		if ((parseInt(myBonus) + parseInt(baseStrike)) > 50 ) {
			if (myFoe.Health <= 1) {
				// death!
				resultString += myFoe.Type + " DIED, ";
			} else {
				myFoe.Health -= 1;
				resultString += myFoe.Type + " lost a health, ";
			}	
			
			if ( genRandomPercent(25)) {
				myHero.Experience = myHero.Experience - 0 + 1;
				resultString += "and " + myHero.Name + " got an experience point!"
			} else {
				resultString += "but " + myHero.Name + " got no experience."
			}
		} else {
			resultString += myHero.Name + " MISSED!";
		}
		CGMApp.run.characters.createCharacterTable( myHero, "#heroTable");
		CGMApp.run.characters.createCharacterTable( myFoe, "#foeTable");
		$("#scoreResults").prepend("<p>" + resultString + "</p>")
	};
	
	//	This function gens a random % from 1 to 100, and returns:
	//		TRUE if the random number was LESS THAN the given success percent
	//		FALSE if the random number is GREATER THAN the success percent 
	// Example: there is a 5% chance of sucess. Call genRandomPercent(5),
	// and it will return true if the number is from 1-5 but false if not.  
	var genRandomPercent = function( percentSuccess ) {
		var randomPercent = Math.floor((Math.random() * 100) + 1);
		if ( randomPercent <= percentSuccess ) {
			return true;
		} else {
			return false;
		}
	};

	return testScoring;
})();

/*
$(document).ready(function() {'use strict';
	new testScoring();
});
*/
