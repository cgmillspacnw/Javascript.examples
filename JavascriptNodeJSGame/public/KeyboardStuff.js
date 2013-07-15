/**
 * @author cgm from a framework by Charlie Calvert
 */

CGMApp.own.KeyboardStuff = (function() {
	
	// Constructor
	function KeyboardInput() {
		window.addEventListener('keydown', doKeyDown, true);
	}
	
	// This function sets the global variables (shudder) based upon where
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
		if ( moveIsSuccessful( proposedNewX, proposedNewY)) {
			
			// Now since this was passed in as an array, NOT a scalar, SHOULD be 
			// by reference by default??  I think??  SO should update the variable
			// in my Game object??  .....
			currPosition[0] = proposedNewX;
			currPosition[1] = proposedNewY;
			
			//CGMApp.run.draw
			currentX_GLB = proposedNewX;
			currentY_GLB = proposedNewY;
			
			// CGM FIXME: check for experience at some point? This is where moves are incremented...
			//character.Moves++;	// = characterStats.moves + 1;
			CGMApp.run.characters.Hero.Moves++;		
			
			moveCheckStats();		// should be a Utility type function...
		}
	};

	// This code is a more general 'check for move success'
	var moveIsSuccessful = function( proposedNewX, proposedNewY) {

		if ( CGMApp.run.Draw.fenceExists(proposedNewX, proposedNewY)) {
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
	
	// Checks and updates characters scores...
	// FIXME: should be in a utility function, with the characterStats object
	// passed in as an argument
	var moveCheckStats = function() {
		if (0 === (CGMApp.run.characters.Hero.Moves % 25)) {
			CGMApp.run.characters.Hero.Experience++;
		}
		// For every 10 moves, there is a 15% chance of incrementing Skill
		if (0 === (CGMApp.run.characters.Hero.Moves % 10)) {
			var randomPercentage = Math.floor((Math.random() * 100));
			if (randomPercentage < 15) {// so for 0-14 found in numbers 0 thru 99
				CGMApp.run.characters.Hero.Skills++;
			}
			//$('#debug').html("gen'd a: " + randomPercentage);
		}
		CGMApp.run.draw.displayCharacterStats();	// Update after movement
	};
	
//	//
//	// IMPORTANT: remember that the row/columns are ZERO-BASED: so if we're
//	// on the BOTTOM row, we're actually on row: (MAX_ROWS - 1)
//	////
//	// Takes in arg for keystroke, and another arg for array of current position [x,y]
//	var moveFigure = function(myKey, myPosition){
//		var proposedNewX = myPosition[0];//currentX;
//		var proposedNewY = myPosition[1];//currentY;
//		
//		switch (myKey) {
//			case 38:
//				/* Up arrow was pressed */
//				proposedNewY -= 1;
//				break;
//			case 40:
//			/* Down arrow was pressed */
//				proposedNewY += 1;
//				break;
//			case 37:
//				/* Left arrow was pressed */
//				proposedNewX -= 1;
//				break;
//			case 39:
//				/* Right arrow was pressed */
//				proposedNewX += 1;
//				break;
//		}
//		// CGM FIXME: Use this function to verify scrolling over
//		// to a new level (i.e. leaving the map out the side etc....)
//		if ( moveIsSuccessful( proposedNewX, proposedNewY)) {
//			currentX = proposedNewX;
//			currentY = proposedNewY;
//			// CGM FIXME: check for experience at some point? This is where moves are incremented...
//			character.Moves++;	// = characterStats.moves + 1;
//			moveCheckStats();		// should be a Utility type function...
//		}
//	};
//
//	// This code is a more general 'check for move success'
//	var moveIsSuccessful = function( proposedNewX, proposedNewY) {
//
//		if (fenceExists(proposedNewX, proposedNewY)) {
//			alert("Ow! You ran into a fencepost!");
//			return false;
//		}
//		// Are we off of the edge?  
//		// NOTE there may be other considerations when there is a 'warp to next level'
//		// position that may be valid...
//		if ((proposedNewX < 0) || (proposedNewX >= MAX_COLUMNS)) {
//			return false;
//		} 
//		if ((proposedNewY < 0) || (proposedNewY >= MAX_ROWS)) {
//			return false;
//		}
//		
//		return true;	// we didn't find a reason to fail, so we're good to go!
//	};
	
	// The BROWSER ITSELF actually passes in the event itself as an argument
	// when the event is done.  
	//
	// ONLY allow movement when the ARROW KEYS are pressed...
	//
	var doKeyDown = function(evt ) {
		switch (evt.keyCode) {
			case 38:
			case 40:
			case 37:
			case 39:
			//case Ctrl-S???
				//moveFigure(evt.keyCode, [ evt.data.currX, evt.data.currY]);
				moveFigure(evt.keyCode, [ currentX_GLB, currentY_GLB]);
				break;
		}
	}; 

	// Charlies...
	var checkForCollision = function(playerX, playerY) {
		var currentGridValue = map[playerY][playerX];
		
		$('#currentGridValue').html('Current Grid Value: ' + currentGridValue);
		if (currentGridValue === 0) {
			$('#collision').html('No Collision');
		} else {
			$('#collision').html('Collision detected');
		}
	};	
	
	// Return the constructor
	return KeyboardInput;
})();

	
	
