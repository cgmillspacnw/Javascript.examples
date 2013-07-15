/**
 * @author cgm from a framework by Charlie Calvert
 */

CGMApp.own.Draw = (function() {
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
		{"key":"pathway","file":"cgmGarden5.gif","cropX":1,"cropY":1},		// one rect down, one over in .gif
		{"key":"figure","file":"cgmGarden5.gif","cropX":1,"cropY":0},		// top row, one rect over in .gif
		{"key":"fencepost","file":"cscGarden02.gif","cropX":0,"cropY":1},	// one row down, first rect in .gif 
		{"key":"orc","file":"cgmGarden5.gif","cropX":2,"cropY":1},	// one row down, second rect in .gif 
		{"key":"rook","file":"cgmGarden5.gif","cropX":2,"cropY":0},	// top row, third rect in .gif 
		{"key":"bishop","file":"cgmGarden5.gif","cropX":2,"cropY":2}	// two rows down, third col over 
		
	];
	
	var fences = [];	// An array of [x,y] positions where the figure may NOT move...
	var FENCEPOSTS = 8;

	// Now, we'll do a 12x12 grid. 
	// REMEMBER: rows are numbered 0 to 11, so if it's == MAX_ROWS we're OFF the grid
	var MAX_ROWS = 12;
	var MAX_COLUMNS = 12;
	
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
	
	var npcs =[ [0,0,1,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,2,0,0,0],
				[0,0,3,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0] ];
	var npcArray = [];		// array of arrays... [ [1, [x,y]], [2, [x,y]]... ] etc
	
	// These will store the figure's current grid block...
	var currentX_GLB = 0;
	var currentY_GLB = 0;
	var currPosition_GLB = [];
	
	// Constructor
	function Draw() {
		context = getCanvas();
		makeImageData();
		setFenceposts();	
		window.addEventListener('keydown', doKeyDown, true);
		
		initNPCArray();
		
		
		setInterval(function() {
			//alert("Moving NPC!");	// Move NPC every 2 seconds
			moveAnyNPC();
		}, 4000);
	}

	// loop thru NPC array, put a property in for each NPC
	var initNPCArray = function() {
		for ( var i=0; i<MAX_ROWS; i++) {		// rows
			for ( var j=0; j<MAX_COLUMNS; j++) {	// columns
				var thisValue = npcs[i][j];
				if ( thisValue != 0 ) {	
					npcArray[thisValue] = [ j, i ];
				}
			}
		}
	};
	
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
			// now the npcs...items...etc  1="orc" (spade) 2="rook" 3=evil bishop
			//count = 0;	// RESET for each row...
			for (var k=0; k<MAX_COLUMNS; k++) {
				if ( 0 != npcs[i][k]) {				// get WHICH should be displayed on the map
					currentPicIndex = npcs[i][k] + 3;	// note that NPC gif pieces are AFTER others...4,5,6 in picturesData
					// Get info for bitmap area to display... 
					xOffset = picturesData[currentPicIndex].cropX;
					yOffset = picturesData[currentPicIndex].cropY;
									
					context.drawImage( pictures[ picturesData[currentPicIndex].file ], xOffset * rectSize, yOffset * rectSize, rectSize, rectSize,
						rectSize * (k + 1), 15 + (rectSize * i), rectSize, rectSize);
				}
			}
			
		}
		// NOW draw the figure....
		xOffset = picturesData[FIGURE_INDEX].cropX;
		yOffset = picturesData[FIGURE_INDEX].cropY;
		context.drawImage(pictures[ picturesData[FIGURE_INDEX].file ], xOffset * rectSize, yOffset * rectSize, rectSize, rectSize,
				rectSize * (1 + currentX_GLB), 15 + (rectSize * currentY_GLB), rectSize, rectSize);
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
	// ? GOAL: load from couchDB!!!
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
				var myRandomX = Math.floor((Math.random()*12));// 0 to 11
				var myRandomY = Math.floor((Math.random()*12));// 0 to 11
				
				// For debugging only...
				//$("#randX").html("X is: " + myRandomX);
				//$("#randY").html("Y is: " + myRandomY);
				
				var myNewFence = [myRandomX, myRandomY];
				
				// If we're at position 0,0 do NOT put a fencepost there... the
				// figure starts at that location!
				if ((0 === myRandomX) && (0 === myRandomY)) {
					continue;	
				}
				// If this x/y pair does NOT already exist as a fence, or NPC, add it
				if ( ! somethingExists(myRandomX, myRandomY)) {
					fences.push(myNewFence);
					map[myRandomY][ myRandomX] = FENCEPOST_INDEX;
					//alert("adding fence at: " + myRandomX + ", " + myRandomY);
				} else {
					continue;	// try a new position... 
				} 
			}  while ( fences.length < FENCEPOSTS);

		}
	};

	// A utility function to quickly see if ANYthing (from ANY array) 
	// is in this position on the map...
	var somethingExists = function( myX, myY) {
		// Walk the fences array...
		for (var i=0; i < fences.length; i++) {
			if ((fences[i][0] == myX) && (fences[i][1] == myY)) {
				// A fencepost is here!
				return true;
			}
		}
		for (var i=1; i <= npcArray.length; i++) {		// check for NPC in this spot
			if ( typeof npcArray[ i] == 'undefined') { 
				continue;
			}
			var thisArray = npcArray[i];
			if ((thisArray[0] == myX) && (thisArray[1] == myY)) {
				return true;	// we've FOUND an npc
			}
		}
		// If we're here, we've walked the fences and NOT found the proposed new location	
		return false;
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
	// A utility function to quickly see if any NPC exists on this position on the map...
	var nonFenceExists = function( myX, myY) {
		// NPCs will have ids of 1, 2, 3 etc.
		for (var i=1; i <= npcArray.length; i++) {		// check for NPC in this spot
			if ( typeof npcArray[ i] == 'undefined') { 
				continue;
			}
			var thisArray = npcArray[i];
			if ((thisArray[0] == myX) && (thisArray[1] == myY)) {
				return true;	// we've FOUND an npc
			}
		}
		// If we're here, we've walked the fences and NOT found the proposed new location	
		return false;
	};

	// This function sets the global variables based upon where
	// the figure is trying to move.
	//
	// IMPORTANT: remember that the row/columns are ZERO-BASED: so if we're
	// on the BOTTOM row, we're actually on row: (MAX_ROWS - 1)
	var moveFigure = function(myKey, currPosition){
		var proposedNewX = currPosition[0];
		var proposedNewY = currPosition[1];
		
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
		if ( moveIsSuccessful( 'hero', proposedNewX, proposedNewY)) {
			
			// Now since this was passed in as an array, NOT a scalar, SHOULD be 
			// by reference by default??  I think??  SO should update the variable
			// in my Game object??  .....
			currPosition[0] = proposedNewX;
			currPosition[1] = proposedNewY;
			
			currentX_GLB = proposedNewX;
			currentY_GLB = proposedNewY;
			
			// CGM FIXME: check for experience at some point? This is where moves are incremented...
			//character.Moves++;	// = characterStats.moves + 1;
			CGMApp.run.characters.Hero.Moves++;		
			
			moveCheckStats();		// should be a Utility type function...
		}
	};
	
	// When we move an NPC see if there is a collision...
	var moveAnyNPC = function( ) {
		if ( npcArray.length < 1) {
			return;		// there's nobody to move!
		}
		// Get random number to pick one
		var whichGuy = Math.floor((Math.random() * (npcArray.length)));		// so 0 to 2, FLOOR so should be okay always for index
		// move specific entity
		moveTheNPC( whichGuy);
	};
	
	// .........pass in the npc's array ...
	var moveTheNPC = function( whichGuy) {
		if( typeof npcArray[ whichGuy] == 'undefined') {
			return;		// something's wrong... NPC doesn't exist?
		}
		var currX = npcArray[whichGuy][1,0];
		var currY = npcArray[whichGuy][1,1];
		var proposedX = currX;
		var proposedY = currY;
		
		// ??? Potentially have different (derived?) classes move differently? rook/bishop?
		// Pass in legal move spots?
		
		//0--1--2    There are 8 connected places they can move... flip an 8-sided 'coin'
		//7--N--3    (N is NPC's curr position)
		//6--5--4
		var whichSpot = Math.floor((Math.random() * 8));	// so 0 to 7, FLOOR so should be okay always for index
		//whichSpot = 1;	// TESTING ONLY: MAKE NPCS MOVE ONE SPACE NORTH  KLUDGE KLUDGE 
		
		if ( whichSpot < 3) { proposedY--; }			// move UP a row
		if ((whichSpot > 3) && (whichSpot < 7)) { proposedY++;}		// move DOWN a row
		if ((0 == whichSpot ) || (7 == whichSpot) || (6 == whichSpot)) { proposedX--;}	// move LEFT a column
		if ((whichSpot > 1) && (whichSpot < 5)) { proposedX++;}		// move RIGHT a column
		
		if ( moveIsSuccessful( npcArray[whichGuy], proposedX, proposedY)) {
			// ack have to update the global array for new movement...
			npcs[currY][currX] = 0;		// have to reset where they WERE!
			npcs[proposedY][proposedX] = whichGuy;
			
			npcArray[whichGuy][1,0] = proposedX;
			npcArray[whichGuy][1,1] = proposedY;
			
			// CGM FIXME: check for experience at some point? This is where moves are incremented...
			//???CGMApp.run.characters.Foe.Moves++;		
			// NPCs get experience too? moveCheckStats();		// should be a Utility type function...
		}
	};
		
	// This code is a more general 'check for move success'
	var moveIsSuccessful = function( whichCharacter, proposedNewX, proposedNewY) {
		if ( 'hero' == whichCharacter) {
			if (fenceExists(proposedNewX, proposedNewY)) {
				alert("Ow! You ran into a fencepost!");
				// potentially decrement Health here??
				return false;
			} else { 
				if (nonFenceExists(proposedNewX, proposedNewY)) {
					alert("HEY watch where you're goin'!!");
					return false;
				}
			}
		} else {		// we're moving an NPC: e.g. [1, [4,7]] is passed in
			if ( somethingExists(proposedNewX, proposedNewY)) {
				return false;
			}
			if ((currentX_GLB == proposedNewX) && (currentY_GLB == proposedNewY)) {
				return false;	// don't let NPC move onto hero!
			}
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
	
	// Checks and updates characters scores...
	// FIXME: should be in a utility function, with the characterStats object
	// passed in as an argument
	var moveCheckStats = function() {
		if (0 === (CGMApp.run.characters.Hero.Moves % 25)) {
			CGMApp.run.characters.Hero.Experience++;
		}
		// For every 10 moves, there is a 15% chance of incrementing Skill
		if (0 === (CGMApp.run.characters.Hero.Moves % 10)) {
			var randomPercentage = Math.floor((Math.random() * 100));		// random from 0 to 99...
			if (randomPercentage < 15) {// so for 0-14 found in numbers 0 thru 99
				CGMApp.run.characters.Hero.Skills++;
			}
			//$('#debug').html("gen'd a: " + randomPercentage);
		}
		CGMApp.run.draw.displayCharacterStats();	// Update after movement
	};

	// Now display on the screen the stats...moves etc...
	Draw.prototype.displayCharacterStats = function() {
		$('#charType').html("Type: " + CGMApp.run.characters.Hero.Type);
		$('#moving').html("Moves so far: " + CGMApp.run.characters.Hero.Moves);
		$('#experience').html("Experience: " + CGMApp.run.characters.Hero.Experience);
		$('#skills').html("Skills: " + CGMApp.run.characters.Hero.Skills);
		$('#health').html("Health: " + CGMApp.run.characters.Hero.Health);
		$('#strength').html("Strength: " + CGMApp.run.characters.Hero.Strength);
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
				moveFigure(evt.keyCode, [ currentX_GLB, currentY_GLB]);
				break;
		}
	}; 

	// Charlies...
	var checkForCollision = function(playerX, playerY) {
		var currentGridValue = map[playerY][playerX];
		$('#currentGridValue').html('Current Grid Value: ' + currentGridValue);
		if (currentGridValue === 0) {
			currentGridValue = npcs[playerX, playerY];
			if ( currentGridValue === 0 ) {
				$('#collision').html('No Collision');	// truly no collision with map OR npc
			} else {
				$('#collision').html('Collided with NPC '+currentGridValue);
			}
		} else {
			$('#collision').html('Collided with '+currentGridValue);
		}
	};	

	// Return the constructor
	return Draw;
})();
