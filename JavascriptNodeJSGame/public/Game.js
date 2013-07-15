/**
 * @author craig.mills
 * From a framework provided by Charlie
 * PROG 282  Week 05 Assignment: Draw Grid with OpenID login
 */
/*jshint jquery:true, browser: true */

CGMApp.own.Game = (function() {

	var myFileLoad = null;		// for file loading library
	var keyboardInput = null;	// for drawing/keyboard
	var myDraw = null;
	
	var context = null;
	var rectSize = 25;
	var pictures = [];
	
/*
	// Defines to use the picturesData array. These will correspond to which 
	// bitmap to display on the canvas.  (e.g. a 0 in the array is grass, 1 is path, etc.)
	var GRASS_INDEX = 0;
	var PATH_INDEX = 1;
	var FIGURE_INDEX = 2;
	var FENCEPOST_INDEX = 3;
	
	// OK I'm trying to "generalize" these attributes.
	// Use this to store the bitmap's name, source, and cropping offset 
	var picturesData = [
		{"key":"grass","file":"cscGarden02.gif","cropX":0,"cropY":0},		// upper left of .gif 
		{"key":"pathway","file":"cgmGarden.gif","cropX":1,"cropY":1},		// one rect down, one over in .gif
		{"key":"figure","file":"cgmGarden.gif","cropX":1,"cropY":0},		// top row, one rect over in .gif
		{"key":"fencepost","file":"cscGarden02.gif","cropX":0,"cropY":1}	// one row down, first rect in .gif 
	];
	
	var fences = [];	// An array of [x,y] positions where the figure may NOT move...
	var FENCEPOSTS = 8;

	// Now, we'll do a 12x12 grid. 
	// REMEMBER: rows are numbered 0 to 11, so if it's == MAX_ROWS we're OFF the grid
	var MAX_ROWS = 12;
	var MAX_COLUMNS = 12;
*/
	
//	// This will eventually get read in via JSON
//	var character = null;
//	var orc = null;
//	var characterStatsList = null;	// used to read in the JSON file


	// Constructor...
	function Game() {
		//CGMApp.run.keyboard = new CGMApp.own.KeyboardStuff();	
		CGMApp.run.draw = new CGMApp.own.Draw();		// instance the grid, etc.
		var myScores = new CGMApp.own.testScoring();
		
		runCharacters();	// ?
		
		$('#saveCharacter').click( saveTheCharacter);
		$('#toggleTestModeButton').click( toggleTestMode );
		
		// get the username, and assign it to the customized links...
		var myUser = $('#customizePane').attr('name');
		$('#gameitself').attr('href', '/gameItself?userName=' + myUser);
		$('#gameandtest').attr('href', '/gameAndTest?userName=' + myUser);
		$('#launchtesting').attr('href', '/launchTesting?userName=' + myUser);
		$('#gridonly').attr('href', '/gridOnly?userName=' + myUser);
	}

	// instance the characters storage
	var runCharacters = function() {
		// Private to this file
		myFileLoad = new CGMApp.own.FileLoad();
		
		// Global to application but not system
		CGMApp.run.display = new CGMApp.own.Display();
		CGMApp.run.characters = new CGMApp.own.Characters();
		
		// Init Characters
		loadHero();
		loadOrc();
		//NOT LOADED YET CGMApp.run.draw.displayCharacterStats();
	};
	var loadHero = function() {
		var fileName = "/Data/Hero.json";
		var selector = "#characterTable";
		
		fileName= "Data/hero.json";
		myFileLoad.readDBJson(fileName, selector);	// NOW read from DB!
		//myFileLoad.getCharacters(fileName, selector);
		
	};
	var loadOrc = function() {
		var fileName = "/Data/Orc.json";
		var selector = "#foeTable";
		
		fileName = "Data/orc.json";
		myFileLoad.readDBJson(fileName, selector);
		//myFileLoad.getCharacters(fileName, selector);	
	};

	// When the user clicks the 'Save' button, we will save the character's values
	var saveTheCharacter = function() {
		var userInput = CGMApp.run.characters.Hero;//character; 
        
		myFileLoad.writeDBJson( "Data/hero.json", userInput);
		/*
        $.ajax({
            type: 'GET',
            url: '/writeCharacter',
            dataType: 'json',
            data: userInput, 
            success: function(data) {
                $('#debug').html(data.result);
            },
            error: function(){$('#debug').html("ERROR SAVING CHARACTER");} 
        });
		*/
    };

	// This function calls the load/unload function for the test page.
	//
	// I NEVER DID GET THIS !#$!%!@# BUTTON WORKING
	// 
	var toggleTestMode = function() { 'use strict';
		var myTemp = 0;
		var myData = null;
		
		$.ajax({
        	type: 'GET',
        	url: '/launchTesting',
        	//dataType: 'text',
        	//data: myData, 
        	success: function(data) {
       			var foo = 0;
       			//('#debug').html(data.result);
       			//showDebug(data.result);
        	},
        	error: function(){$('#debug').html("ERROR TOGGLING TEST MODE");} 
        });
        
		//loadUnloadTestPage( $('#rightie table').length);
	};
	 
	// This page uses handlebars to bring in (or discard) the
	// testScoring.HTML file, to allow testing of the combat.
	//
	// If this function is called with nUnload of 0, it will 
	var loadUnloadTestPage = function( nUnload) {
		// pseudo-code: if count of tables > 0, then we LOAD
		if ( nUnload > 0) {	// $('#rightie table').length > 0)
			// we have the tables... must remove 'em
			$('#rightie').empty();
		} else { 
			$('#rightie').load('TestScoring.html #testScoreContainer');
		}
	};
			
	var createMyDirectory = function() {
		$.getJSON('/createMyDirectory?dir_name=' + getDirName, function(result) {
			$('#debug').append('<li>' + JSON.stringify(result) + '</li>');
		}).success(function() {
			console.log("cgm: createDir called");
		}).error(function(jqXHR, textStatus, errorThrown) {
			showError(jqXHR, textStatus, errorThrown);
		}).complete(function() {
			console.log("cgm: completed call to createDir");
		});
		return; 
	};

	return Game;
})();


$(document).ready(function() {'use strict';
	new CGMApp.own.Game();
});
