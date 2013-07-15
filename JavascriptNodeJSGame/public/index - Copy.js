/**
 * @author craig.mills
 * From a framework provided by Charlie
 * PROG 282  Week 05 Assignment: Draw Grid with OpenID login
 */
/*jshint jquery:true, browser: true */


// CGM FIXME: add a Utility module (Login etc) ... maybe the Drawing module... (drawMap, moveFigure?)
// ALSO maybe have another module for updating the character's information: moves, experience, etc. 
// (which are called when the user clicks the "Save" button or keys in "ctrl-S" maybe...?  I like a button..



CGMApp.own.Game = (function() {

	var context = null;
	var rectSize = 25;
	var pictures = [];
	
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
	
	// This will eventually get read in via JSON
	var character = null;
	var orc = null;
	
	/*
	var characterStats = {};
	characterStats.Name = "me";
	characterStats.Moves = 0;
	characterStats.Experience = 0;
	characterStats.Skills = 0;
	*/
	
	var characterStatsList = null;	// used to read in the JSON file
	
	// A 12x12 array... hard-coded for now but SOON will be adding in a load from JSON
	// from the server, depending upon which "level" the character is currently roaming
	// Maybe a '0' = grass, a '1'1 
	var map = [ [1,1,1,1,1,1,1,1,1,0,0,0],
				[0,1,1,0,0,0,0,0,1,0,0,0],
				[0,0,1,1,1,1,0,0,1,0,0,0],
				[0,0,1,0,0,1,0,0,1,0,0,0],
				[0,1,1,0,0,1,1,1,1,0,0,0],
				[0,1,0,0,0,1,0,1,1,0,0,0],
				[0,1,0,0,0,1,0,1,1,0,0,0],
				[0,1,0,0,0,1,1,1,1,0,0,0],
				[0,1,0,0,0,1,0,0,1,0,0,0],
				[0,1,0,0,0,1,0,0,1,0,0,0],
				[0,1,1,1,1,1,1,0,1,1,0,0],
				[0,0,0,0,0,0,1,1,1,1,1,1]  ];

	
	// These will store the figure's current grid block...
	var currentX = 0;
	var currentY = 0;
	
	// Constructor...
	function Game() {
		// CGM FIXME: have the user log in beforehand, and have the Game start
		// only AFTER they have logged in with a valid OpenID.  
		//if(! loginSuccessful()) { return;}
		
		// OK if this page is thrown, we're successfully logged in.
		// read character file... username???
		this.getCharacters();
		
		$('#saveCharacter').click( saveTheCharacter);
		$('#toggleTestModeButton').click( toggleTestMode );
		// CAN'T DO THIS: not prototyped..........this.toggleTestPane();
		//this.loadUnloadTestPage(0);		// default to NOT having the test pane visible... 

		context = getCanvas();
		makeImageData();
		setFenceposts();	
		
		window.addEventListener('keydown', doKeyDown, true);
	}

	Game.prototype.getCharacters = function() {
		$('#debugGrid').html("Get Characters called");
		request = $.ajax({
			type : "get",
			url : '/getCharacterStats',
			cache : false,
			dataType : "json",
			success : function(data) {
				var myHold = 0;
				var myData = data;
				
				console.log(data);
				character = data;
				displayCharacterStats( character);
				
				$('#debug').html("");
			},
			error : function(){$('#debug').html("ERROR FOUND");}
		});
	};

	var setCharacterValues = function(data) {
		for(var propt in data){
    		alert(propt + ': ' + data[propt]);
			characterStats[ propt ] = data[propt];
		}		
	}

	var displayCharacterStats = function(theCharacter) {
		var myCharacter = theCharacter;
		//var movie = theCharacter.Moves;
		var meeee = myCharacter.Moves;
		
		$('#moving').html("Moves so far: " + theCharacter.Moves);
		$('#experience').html("Experience: " + theCharacter.Experience);
		$('#skills').html("Skills: " + theCharacter.Skills);
	};

	var displayCharacterTable = function() {
		// re-write the entire (?) table
		$("#statisticsTable").empty();
		for ( var value in characterStatsList) {
			var a = "foo" + value;
	        var b = "bar" + value;
			data = "<tr><td>" + a + "</td>" + "<td>" + b + "</td></tr>";
	        $("#statisticsTable").append(data); 
		};

	};

	// When the user clicks the 'Save' button, we will save the character's values
	var saveTheCharacter = function() {
		var userInput = character; 
        
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
    };

	// This function calls the load/unload function for the test page.
	var toggleTestMode = function() { 'use strict';
		var myTemp = 0;
		var myData = null;
		
		//$.get('localhost/launchTesting', function(list) {
		//	//$('#response').html(list); // show the list
    	//})
    	//.fail(function() { $('debug').html("ERROR TOGGLING TEST MODE"); });
	
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
			
		
		/*	// Now using handlebars.... 
		 
		 	var source = $('#testBoilerplate').html();
			var template = Handlebars.compile(source);
		    var testPane = 
		    
		    var result = template({
		        testingPaneContents: testPane        
		    });    
		    
		    $("#rightie").append(result); 

		*/
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


	
/*	// 
	var setCharacterStats = function() {
		//display.clearResponse();
		var count = 0;
		$(characterStatsList).each(function() {
			var myStat = $(this).
			characterStats.
			
			$(this).each(function() {
				this.itemName = 'item' + count++;
				display.displayRow(this);
			});
		});
	};
*/
	
	// This function is called every 50ms, to refresh the grid.
	var draw = function() {
		var count = 0;
		var currentPicIndex = null;		// default...
		var xOffset, yOffset = 0;
		// Draw the rows, and columns, of the grassy bitmap
		for (var i=0; i<MAX_ROWS; i++){
			count = 0;		// RESET this for each new row...
			for (var j=0; j<MAX_COLUMNS; j++){
				currentPicIndex = map[i][j];		// get WHAT should be displayed on the map
				// Get info for bitmap area to display... 
				xOffset = picturesData[currentPicIndex].cropX;
				yOffset = picturesData[currentPicIndex].cropY;
				context.drawImage( pictures[ picturesData[currentPicIndex].file ], xOffset * rectSize, yOffset * rectSize, rectSize, rectSize,
					rectSize * (count++ + 1), 15 + (rectSize * i), rectSize, rectSize);
			}
		}
		// NOW draw the figure....
		xOffset = picturesData[FIGURE_INDEX].cropX;
		yOffset = picturesData[FIGURE_INDEX].cropY;
		context.drawImage(pictures[ picturesData[FIGURE_INDEX].file ], xOffset * rectSize, yOffset * rectSize, rectSize, rectSize,
				rectSize * (1 + currentX), 15 + (rectSize * currentY), rectSize, rectSize);
	};

	// This freaky function includes an anonymous function which is passed in AS A PARAMETER,
	// so that it can be locked onto the 'onload' method of the HTML5 Image element.
	var makeImageData = function() {
		var images = [];
		// Create an array of the image files used... 
		for (var i=0; i<picturesData.length; i++) {
			if (-1 == images.indexOf( picturesData[i].file)) 
			{
				images.push(picturesData[i].file);
			}
		}
		var x = 10;	
		loadImages(images, function(pictures, a) {
			var fileName = images[a];
			// We will NOT display the top line of the images, now, when it's loaded, so COMMENT this next line...
			//context.drawImage(pictures[fileName], 0, 0, 2*rectSize, 3*rectSize, 2*(rectSize * (a + 1)), 10, 2*rectSize, 3*rectSize);
		});
	};

	// This function loads up the pictures object
	var loadImages = function(images, callback) {
		var a = 0;

		function onLoad() {
			callback(pictures, a++);
		}

		for (var i = 0; i < images.length; i++) {
			var fileName = images[i];
			pictures[fileName] = new Image();
			pictures[fileName].onload = onLoad;
			pictures[fileName].src = fileName;
		}
	};

	// Place some random "fence-posts"
	// This could get ugly (i.e. time-consuming) if we have a LOT of fenceposts
	// compared to grid squares, as we may get dupes after dupes after dupes.
	var setFenceposts = function() {
		// If we are NOT set for fenceposts, do NOT try to add any!
		if ( FENCEPOSTS > 0 ) {
			do {
				// Gen a random number from 0 to 11 
				var myRandomX = Math.floor((Math.random()*12));
				var myRandomY = Math.floor((Math.random()*12));
				
				// For debugging only...
				//$("#randX").html("X is: " + myRandomX);
				//$("#randY").html("Y is: " + myRandomY);
				
				var myNewFence = [myRandomX, myRandomY];
				
				// If we're at position 0,0 do NOT put a fencepost there... the
				// figure starts at that location!
				if ((0 === myRandomX) && (0 === myRandomY)) {
					continue;	
				}
				// If this x/y pair does NOT already exist as a fence, add it
				if ( ! fenceExists(myRandomX, myRandomY)) {
					fences.push(myNewFence);
					map[myRandomY][ myRandomX] = FENCEPOST_INDEX;
					//alert("adding fence at: " + myRandomX + ", " + myRandomY);
				} else {
					continue;	// try a new position... 
				} 
			}  while ( fences.length < FENCEPOSTS);

		}
	};

	// A utility function to verify we don't duplicate or 
	// walk into fenceposts
	var fenceExists = function( myX, myY) {
		// Walk the fences array...
		for (var i=0; i < fences.length; i++) {
			if ((fences[i][0] == myX) && (fences[i][1] == myY)) {
				// A fencepost is here!
				return true;
			}
		}	
		// If we're here, we've walked the fences and NOT found the proposed new location	
		return false;
	};

	// This function sets the global variables (shudder) based upon where
	// the figure is trying to move.
	//
	// IMPORTANT: remember that the row/columns are ZERO-BASED: so if we're
	// on the BOTTOM row, we're actually on row: (MAX_ROWS - 1)
	var moveFigure = function(myKey){
		var proposedNewX = currentX;
		var proposedNewY = currentY;
		
		switch (myKey) {
			case 38:
				/* Up arrow was pressed */
				proposedNewY -= 1;
				break;
			case 40:
				/* Down arrow was pressed */
				proposedNewY += 1;
				break;
			case 37:
				/* Left arrow was pressed */
				proposedNewX -= 1;
				break;
			case 39:
				/* Right arrow was pressed */
				proposedNewX += 1;
				break;
		}
		// CGM FIXME: Use this function to verify scrolling over
		// to a new level (i.e. leaving the map out the side etc....)
		if ( moveIsSuccessful( proposedNewX, proposedNewY)) {
			currentX = proposedNewX;
			currentY = proposedNewY;
			// CGM FIXME: check for experience at some point? This is where moves are incremented...
			character.Moves++;	// = characterStats.moves + 1;
			moveCheckStats();		// should be a Utility type function...
		}
	};
	

	// Checks and updates characters scores...
	// FIXME: should be in a utility function, with the characterStats object
	// passed in as an argument
	var moveCheckStats = function() {
		if (0 === (character.Moves % 25)) {
			character.Experience++;
		}
		// For every 10 moves, there is a 15% chance of incrementing Skill
		if (0 === (character.Moves % 10)) {
			var randomPercentage = Math.floor((Math.random() * 100));
			if (randomPercentage < 15) {// so for 0-14 found in numbers 0 thru 99
				character.Skills++;
			}
			//$('#debug').html("gen'd a: " + randomPercentage);
		}
		displayCharacterStats( character );	// FIXME: make this a util or display function!
		
	};
	
	// This code is a more general 'check for move success'
	var moveIsSuccessful = function( proposedNewX, proposedNewY) {

		if (fenceExists(proposedNewX, proposedNewY)) {
			alert("Ow! You ran into a fencepost!");
			return false;
		}
		// Are we off of the edge?  
		// NOTE there may be other considerations when there is a 'warp to next level'
		// position that may be valid...
		if ((proposedNewX < 0) || (proposedNewX >= MAX_COLUMNS)) {
			return false;
		} 
		if ((proposedNewY < 0) || (proposedNewY >= MAX_ROWS)) {
			return false;
		}
		
		return true;	// we didn't find a reason to fail, so we're good to go!
	};
	
	// This function "grabs on" to the canvas HTML5 element in our
	// index.html file.
	var getCanvas = function() {
		var canvas = document.getElementById('mainCanvas');
		if (canvas !== null) {
			var context = canvas.getContext('2d');
			setInterval(draw, 50);
			return context;
		} else {
			$("#debug").css({
				backgroundColor : "blue",
				color: "yellow"
			});
			$("#debug").html("Could not retrieve canvas");
			return null;
		}
	};
	
	// The BROWSER ITSELF actually passes in the event itself as an argument
	// when the event is done.  
	//
	// ONLY allow movement when the ARROW KEYS are pressed...
	//
	var doKeyDown = function(evt) {
		switch (evt.keyCode) {
			case 38:
			case 40:
			case 37:
			case 39:
			//case Ctrl-S???
				moveFigure(evt.keyCode);
				break;
		}
	}; 

	return Game;
})();


$(document).ready(function() {'use strict';
	new CGMApp.own.Game();
});
