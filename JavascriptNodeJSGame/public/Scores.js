/**
 * @author Charlie Calvert
 * 
 */

/*global CGMApp:true*/
/*jshint jquery: true, browser: true, devel: true */

CGMApp.own.Scores = (function() {
	'use strict';
	
	function Scores() {
		Object.defineProperty(this, "roll", withValue(-1));
		Object.defineProperty(this, "bonus", withValue(-1));
	}	
	
	function withValue(value) {
		var d = withValue.d || (withValue.d = {
			enumerable : false,
			writable : true,
			configurable : true,
			value : null
		});
		d.value = value;
		return d;
	}
		
	var getRoll = function() {
		return Math.floor(Math.random() * 100) + 1;
	};
	
	var getRollBonus = function() {
		var roll = getRoll();
		if (typeof CGMApp.run.display !== 'undefined') {
			CGMApp.run.display.showDebug(roll);
		}
		return roll + CGMApp.run.characters.Hero.Experience + CGMApp.run.characters.Hero.Strength;
	};
	
	Scores.prototype.conflict = function(func) {
		var rollBonus = getRollBonus();
		this.bonus = rollBonus;
		if (rollBonus > 50) {
			if (typeof CGMApp.run.characters.Orc !== 'undefined') {
				CGMApp.run.characters.Orc.Health -= 1;			
			}
		}
		func(CGMApp.run.characters.Orc);
		return CGMApp.run.characters.Orc;
	};
	
	Scores.prototype.move = function() {
		if (CGMApp.run.characters.Hero !== undefined) {
			CGMApp.run.characters.Hero.Moves++;
			$("#moves").html(CGMApp.run.characters.Hero.Moves);
			if (CGMApp.run.characters.Hero.Moves % 250 === 0) {
				CGMApp.run.characters.Hero.Experience++;
				$("#experience").html(CGMApp.run.characters.Hero.Experience);
			}			
		}		
	};
	
	Scores.prototype.showScore = function() {
		var characters = CGMApp.run.characters;
		characters.createCharacterTable(characters.Hero, '#heroTable');
		characters.createCharacterTable(characters.Orc, '#foeTable');
	};
	
	Scores.prototype.unitTests = function() {
		/*
		test("ScoresUnitTests", function() {
			var actual = getRoll();
			ok(actual < 101 && actual > 0, "Get Roll in range");
		});
		*/
	}
	
	return Scores;
}());