/**
 * @author craig.mills
 * From a framework taught by Charlie Calvert
 * DMA 265 FINAL PROJECT
 June, 2013
 
 A bridge-playing website, based upon the "module" pattern.  (aka the Functional
 Inheritance, or Factory design pattern.)  
 
 There is still a lot of work to be done on this.
	 -- some more A.I. for defenders 
	 -- make non-draggable the dummy/my cards when it's NOT that player's turn
	 -- ensure we're following suit... ?? that wouldn't be TOO hard... ? would it??
	 -- "tart up" the screen a bit...make some alignment adjustments/cleanup...
	 -- make the cards a bit more interesting, visually?
	 -- enable playing in a trump suit contract (NOT just in notrump) would take some work
	 -- I would prefer to see the hands stored in a db of some sort, and pulled from there
	 
 */
/*jshint jquery:true, browser: true */

//
// This is the main banana... the whole enchilada... CGMApp is the only thing in the Javascript
// global namespace, and this entire game is an object within the "own" object within CGMApp.
//
CGMApp.own.bridgeGame = (function() { 'use strict';
	var myHand_GLB = {};
	var dummysHand_GLB = {};
	var rightysHand_GLB = {};
	var leftysHand_GLB = {};
	
	// IMPORTANT: this variable stores the cards played to the trick so far: 
	// e.g. for the initial opening trick it might have something like:
	//	[  ["Lefty", ["S","4"]], ["Dummy", ["S", "7"]], ["Righty", ["S","J"] ]  ] 
	//  playedToTrick_GLB[player]     playedToTrick_GLB[0][1][0] stores "S": the suit required to follow to
	var playedToTrick_GLB = [];	
	
	var whosePlayIsIt_GLB = "";			// tracks whose turn it is to play (basically, "Dummy" or "You")
	var currentCardWidth_GLB = 0;	// stores the width of the card to display in lefty/righty spot
	var displayTrickWinner_GLB = true;
	
	var theSuitIDs = ["S","H","C","D"];		// these are the indexes into the hand's cards themselves
	var theSuits = { "S": ["Spades", "spade_small"], 
			"H": ["Hearts", "heart_small"], 
			"C": ["Clubs", "club_small"],
			"D": ["Diamonds", "diamond_small"] };
	// We'll ID the indexes into theSuits, to make code clearer
	var DIV_ID_INDEX = 0;
	var IMG_ID_INDEX = 1;
	
	// Some defines 
	var DUMMY = "Dummy";
	var RIGHTY = "Righty";
	var YOU = "You";
	var LEFTY = "Lefty";
	var LEAD_TO_TRICK = "Lead";
	var FOLLOW_TO_TRICK = "Follow";
	
	// Now the variables which will hold our other library source files...
	var myAI = null;
	
	// This is the CONSTRUCTOR... this is called ONCE from the DOM's 
	// document ready function.  [See very bottom of this file.]
	function bridgeApp() {
		myAI = new CGMApp.own.playAI();		// local copy of my (limited!) AI
		
		$("#toggleInstructs").click( function() {
			if ( $("#whatDummyPlayed .instructs").text() == " ") {
				$("#whatDummyPlayed .instructs").text("PLAY DUMMY'S CARD HERE");
				$("#toggleInstructs").html("Hide Instructions");
			} else {
				$("#whatDummyPlayed .instructs").text(" "); 
				$("#toggleInstructs").html("Show Instructions");
			}	
			if ( $("#whatIplayed .instructs").text() == " ") {
				$("#whatIplayed .instructs").text("PLAY YOUR CARD HERE");
			} else {
				$("#whatIplayed .instructs").text(" "); 
			}	
		});
		// Start with the debug paragraph for opponents' cards HIDDEN
		$("#toggleDebugs").click( function() {
			var me = $("#toggleDebugs").html();
			if ( me.match(/Show/) ) {
				$("#toggleDebugs").html("Hide Defenders'");
			} else {
				$("#toggleDebugs").html("Show Defenders'");
			}
			$(".debug").toggle();
		});
		// We can turn off the 'alert' at the end of each trick...
		$("#toggleTrickMsg").click( function() {
			if (displayTrickWinner_GLB) {
				displayTrickWinner_GLB = false;
				$("#toggleTrickMsg").html( "Enable Trick Winner");
			} else {
				displayTrickWinner_GLB = true;
				$("#toggleTrickMsg").html( "Disable Trick Winner");
			}
		});
		$(".debug").toggle();		// HIDE the debug <p>s initially
		
		$("#startButton").click( start_game);
		$("#tricksResults").hide();	// hide until hand starts...
		
		$( "#whatDummyPlayed" ).droppable({
			accept: function( droppedElement) {
				if ( $(droppedElement).is(".dummysCard") && ( DUMMY == whosePlayIsIt_GLB )) {
					// FUTURE Can I check the suit somehow here? Verify they're following IF they have one?
					// just would have to code up the callback function, I think?  Led Suit is from previouslyPlayed_GLB
					//if (myAI.have_card_in_suit_led(hand, suit) {
					// if ( previouslyPlayed_GLB.length = 0) { // we're first to play...play ANY card...
					//else if we have a card in suit led, MUST play one??  Maybe even make JUST them draggable?
						return true;
					
				} else { 
					return false;		// it's either not our turn, or not a dummy card
				}
			},
			activeClass: "ui-state-hover",
			hoverClass: "ui-state-active",
			drop: function( event, ui ) {
				droppedTheCard( ui.draggable );
			}
		});
		$( "#whatIplayed" ).droppable({
			accept: function( droppedElement) {
				if ( $(droppedElement).is(".cardIsMine") && ( YOU == whosePlayIsIt_GLB)) {
					return true;
				} else { 
					return false;
				}
			},
			activeClass: "ui-state-hover",
			hoverClass: "ui-state-active",
			drop: function( event, ui ) {
				droppedTheCard( ui.draggable );
			}
		});

	}

	//
	// This starts everything off, when the user clicks the Start button...
	//
	var start_game = function() {
		// Set up game variables... 
		load_up_hands();
		
		// Here is the meat of the action!
		display_dummy( dummysHand_GLB);
		// display everything
		display_my_hand( myHand_GLB);	
		
		$("#dummysPlay").remove();		// Clear out any played cards, in case re-starting 
		$("#myPlay").remove();			// Clear out my played card
		$("#LeftysCard").empty();
		$("#RightysCard").empty();
		$("#tricksResults").show();	// hide until hand starts...
		// Reset the tricks won/lost counters
		$("#tricksLost").text("0");
		$("#tricksWon").text("0");
		
		// Start with Leftys opening lead 
		play_a_card( "Lefty", LEAD_TO_TRICK);
		whosePlayIsIt_GLB = DUMMY;
	};
	
	//
	// This function finds a (semi??) appropriate lead/play for Lefty or Righty,
	// the computer defenders, and updates the hands and screens to reflect it.
	//
	// If leadOrFollow is 'Lead' then this is the first card to be led
	// If leadOrFollow is 'Follow' then we are NOT playing first...
	//
	var play_a_card = function( player, leadOrFollow) {
		var players_hand = null;
		var nextPlayer = "";		// this will set whose turn it is next..
		
		if ( LEFTY == player) { 
			players_hand = leftysHand_GLB;
			nextPlayer = DUMMY;
		} else {
			players_hand = rightysHand_GLB;
			nextPlayer = YOU;
		} 
		
		var myCard = [];
		var myArray = [];
		if ( LEAD_TO_TRICK == leadOrFollow) {
			myCard = myAI.find_a_lead( players_hand ); 
			myArray.push(player);
			myArray.push(myCard);
			// RESET the global array of cards played to this trick... we're playing FIRST!
			playedToTrick_GLB = [];
			playedToTrick_GLB.push(myArray);		// we are the FIRST to play to the trick!
		} else {
			myCard = myAI.play_a_card( players_hand, playedToTrick_GLB);
			myArray.push(player);
			myArray.push(myCard);
			playedToTrick_GLB.push(myArray);	// we must RETAIN who else has played to the trick!
		}
		
		// So now myLead holds something like [ "D", "J" ]
		var cardIndex = get_cards_index_in_hand( players_hand, myCard)

		// Display the card appropriately
		display_defenders_card( player, myCard);
		
		// Remove the card from the defender's hand
		remove_card_from_hand( players_hand, cardIndex);
		
		// Update the debug text accordingly...
		if ( LEFTY == player ) {
			set_debug_text( leftysHand_GLB, "leftysCards");	
		} else { 
			set_debug_text( rightysHand_GLB, "rightysCards");
		};
		
		whosePlayIsIt_GLB = nextPlayer;
		
		// As a final task, must see whether all players have played to the trick.
		// If they HAVEN'T, then it's the player's turn to drag-and-drop a card, so 
		// we really don't care here whether it returns true or false...
		check_whether_trick_finished();		// see whether all four have played to this trick...
	};
	
	//
	// This function is responsible for determining the winner of the trick, and starting
	// the next trick
	//
	var check_whether_trick_finished = function() {
		if ( 4 == playedToTrick_GLB.length ) {
			// ALL FOUR HAVE PLAYED TO THE TRICK!  Resolve the trick!
			finish_the_current_trick();
			return true;
		} else {
			return false;
		}
	};
	
	//
	// Determine winner, set next player, etc.  Also finishes hand if all 13 tricks 
	// have now been played.  
	// 
	var finish_the_current_trick = function() {
		var tricksWon = 0;
		var tricksLost = 0;
		var trickCount = 0;
		var trickSelector = "";		// depends whether declarer or defenders won trick
		var otherSelector = "";
		
		// See who won the trick...
		var winner = myAI.who_won_the_trick( playedToTrick_GLB);
		
		// Toggle OFF the message box if you don't wanna see it....
		if ( displayTrickWinner_GLB) {
			alert( winner + " won this trick!");
		}
		// Update the "Tricks Won: and "Tricks Lost: " display HTML
		if ((YOU == winner) || (DUMMY == winner)) {
			trickSelector = "#tricksWon";
			otherSelector = "#tricksLost";
		} else {
			trickSelector = "#tricksLost";
			otherSelector = "#tricksWon";
		}
		// how many has the winner of this trick won?
		tricksWon = $(trickSelector).text();	// get the text...
		tricksWon = parseInt( tricksWon );	// now change it to an Int
		tricksWon++;
		$(trickSelector).text( tricksWon.toString() );
		// NOW, how many tricks have the winner of THIS trick LOST?
		tricksLost = $(otherSelector).text();
		tricksLost = parseInt( tricksLost );
			
		// If we've played 13 tricks, the hand is DONE!
		if ( 13 == (tricksWon + tricksLost) ) { 
			
			alert( "All 13 tricks have been played!  Load another hand to play again.");
			// FUTURE here, maybe compare score to some who played the hand? Give 'em a "grade"?
			
			// Clean out the divs where cards were displayed...
			clear_played_card_displays();
				
		} else {
			// Clean out the divs where cards were displayed...
			clear_played_card_displays();
			
			playedToTrick_GLB = [];		// reset ...
			
			whosePlayIsIt_GLB = winner;		// winner of trick plays 
			
			// This APPEARS to be skewing my logic.....
			// if lefty/righty won, have them lead another card...
			if ((LEFTY == winner) || (RIGHTY == winner)) {
				play_a_card( whosePlayIsIt_GLB, LEAD_TO_TRICK);
			}
		}
	};
	
	//
	// Remove the played cards from the screen
	//
	var clear_played_card_displays = function() {
		$("#LeftysCard").empty();
		$("#RightysCard").empty();
		$("#dummysPlay").remove();
		$("#myPlay").remove();
	};

	// 
	// This function is very interesting.  So much so that I have camel-case named it, 
	// instead of my usual C-style underscore_naming.  This function is a callback function
	// which is called when a card is (SUCCESSFULLY) dropped onto the proper card play area.
	//
	// This function is the heart of everything that happens: it is what drives the program's
	// logic when the user moves a card.  Everything is done here, including:  creating the div 
	// which displays the card, updating the global variables storing the hands (and which cards
	// have been played to the hand), and then calls the routine for the defenders to play.
	// 
	var droppedTheCard = function( $item) {  //, player) {
		var droppedID = $item.prop("id");
		var cardPlayDivSelector = "";
		var cardObjectSelector = "";
		var cardObjectName = "";
		var dummysOrMine = "";		// will be set to 'dummy' or 'mycard' to tell WHICH one was dropped..
		var currentPlayer = "";	// for storing who has played to the trick...
		var nextPlayer = "";		// Stores the next player to play to the trick, in case there is another
		
		// NOW determine whether it was dummy's card, or mine, which was played.
		// We can tell from the id of the item dropped.
		if ( null != (droppedID.match(/dummy/)) ) {
			// it's a dummy's card
			cardPlayDivSelector = "#whatDummyPlayed";
			cardObjectSelector = "#dummysPlay";
			cardObjectName = "dummysPlay";
			dummysOrMine = "dummy";
			currentPlayer = DUMMY;
			nextPlayer = RIGHTY;
		} else {
			// it was my card dropped
			cardPlayDivSelector = "#whatIplayed";
			cardObjectSelector = "#myPlay";
			cardObjectName = "myPlay";
			dummysOrMine = "myPlay";
			currentPlayer = YOU;
			nextPlayer = LEFTY;
		}
		
		$item.draggable("disable");			// NO LONGER let them drag the dropped card...
		
		// Display function removes dummy's card; we must move it to the whatDummyPlayed div 
		var myCurrentHTML = $item.html();		// save the rank, suit of current card
		
		// Get rid of any card div previously added within the "played" div
		var divSelector = cardPlayDivSelector + " div";
		$(divSelector).remove();	// REMOVE the div from where it originated...
		
		// Now add a new div, to store the card, within whatDummyPlayed/whatIplayed div
		var myNewHTML = "<div id='";
		myNewHTML += cardObjectName;
		myNewHTML += "' class='playedCard'></div>";
		$(cardPlayDivSelector).append(myNewHTML);
		
		// Now, we add the card dummy (or I) played
		$(cardObjectSelector).html(myCurrentHTML);		// restore the rank/suit for card
		
		// Took some work to figure THIS out...I HAD to put the width via CSS or it didn't take
		var newWidth = $item[0].offsetWidth;				// save card's width (in pixels)
		//not working...$("dummysPlay").css( "width", newWidth);
		//still not ...$("#dummysPlay").attr( "width", "" + newWidth + "px");
		$(cardObjectSelector).css( "width", "" + newWidth + "px");
		
		// Now, remove the card from dummy's cards
		var theNumber = droppedID.match(/(\d+)/)[1];		// ? Not quite sure WHY I need the [1] here..but I do
		
		// So now we can find and REMOVE that card from the hand...
		if (  'dummy' == dummysOrMine ) {
			dummysHand_GLB = remove_card_from_hand( dummysHand_GLB, theNumber);
			// Draw the dummy hand again, to show it without the played card!
			display_dummy( dummysHand_GLB);
		} else { 
			myHand_GLB = remove_card_from_hand( myHand_GLB, theNumber);
			// Draw my hand again, to show it without the played card!
			display_my_hand( myHand_GLB);
		}
		
		// Record that this card was played to this trick...
		var mine = myCurrentHTML;
		var myRank = mine.charAt(0);	// first letter is card's rank
		// split the string on images/...
		var arrayOfStrings = mine.split("images/");
		// ...then upper-case that first letter...
		var mySuit = arrayOfStrings[1].charAt(0).toUpperCase();	
 
		playedToTrick_GLB.push([ currentPlayer, [mySuit, myRank] ]);
		
		// And, now, it's time to let the next player play to the trick...
		whosePlayIsIt_GLB = nextPlayer;
		
		// As a final task, must see whether all players have played to the trick
		if ( !check_whether_trick_finished()) {		// see whether all four have played to this trick...
			play_a_card( whosePlayIsIt_GLB, FOLLOW_TO_TRICK);
		}
	};
	  
	//
	// This function gets the index of a card within a hand, so that we 
	// can then remove it.  ?? This seems kinda convoluted but I'm goin' with it
	//
	// It takes a hand, and a card which is an object such as { D: "7" }
	//
	var get_cards_index_in_hand = function( hand, card) {
		var suitSought = card[0];		// Does this EVEN work on an object??? Maybe I should use array ["S","K"]
		var rankSought = card[1];
		var currentSuit = "";
		var indexCounter = 0;
		
		for ( var i=0; i < theSuitIDs.length; i++) {
			currentSuit = theSuitIDs[i];		// Suit is the key in the key/value pair
			var cardsInSuit = hand[ currentSuit ];
			
			// NOW, for each CARD within the suit....
			for (var j=0; j < cardsInSuit.length; j++) { 
				if ((suitSought == currentSuit) && (rankSought == cardsInSuit[j])) {
					// we have FOUND the card...
					return indexCounter;
				}
				indexCounter++;		// Have not found the card yet... keep goin'
			}
		}
		// ?????? What if we did NOT find that card in the hand?  "should" never get here?
		alert( "Couldn't find card '" + rankSought + "' within suit " + suitSought);
		return -1;	// ??
	};
	
	//
	// We must remove the played card from the hand, and then return the 
	// hand itself withOUT the card played.
	//
	var remove_card_from_hand = function( hand, cardIndex) {
		var myCounter = 0;		// start at the beginning of the hand...
		var mySuitID = "";
		
		//for (var key in hand) {
		// Gah!  This was 45 mins to find... and was the reason I switched to arrays...
		// !! Gotta go through the suits in the RIGHT, KNOWN order!  
		for ( var i=0; i < theSuitIDs.length; i++) {
			mySuitID = theSuitIDs[i];		// Suit is the key in the key/value pair
			var cardsInSuit = hand[ mySuitID ];
			
			// NOW, for each CARD within the suit....
			for (var j=0; j < cardsInSuit.length; j++) { 
				if ( myCounter == cardIndex) {
					// we must remove this card...
					cardsInSuit.splice(j, 1);
					hand[ mySuitID ] = cardsInSuit;
					
					// now return the new hand....
					return hand;
				}
				myCounter++;	// we have not found the card yet... keep goin'
			}
		}
		// Error handling??? Didn't find the card?  Could get ugly...
		// But "should" NEVER get to this line....
		alert( "?? Card not found to remove?");	
	};
	
	//
	// This function takes a hand as input, and displays it in the dummy area
	//
	var display_dummy = function( hand ) {
		// so we will go through the hand, display each card.
		var nCard = 0;
		var nTopPosition = 0;
		var myNewID = "";
		var suitsDIV = "";
		var thisSuitID = "";
		var myBeginHTML = "<div id='dummy" 
		var myEndHTML = "' class='singleCard dummysCard'></div>";
		var myHTML = "";		// used for writing the new card 
		
		// KEY HERE: gotta DELETE dummy's existing cards, so we can re-create them
		// using the same unique ids (dummy0, dummy1 etc.)
		$("#dummySpades").empty();
		$("#dummyHearts").empty();
		$("#dummyClubs").empty();
		$("#dummyDiamonds").empty();
		
		// VERY important here... ALWAYS walk the hand in the SAME suit order!
		for ( var i=0; i < theSuitIDs.length; i++) {
			thisSuitID = theSuitIDs[i];		// Suit is the key in the key/value pair
			var cardsInSuit = hand[ thisSuitID ];
		
			nTopPosition = 0;		// Reset top position for new suit
			
			// NOW, for each CARD within the suit....
			for (var j=0; j < cardsInSuit.length; j++) {
				// Find div where we'll be adding this suit
				suitsDIV = "#dummy" + theSuits[ thisSuitID ][ DIV_ID_INDEX ];
				// Now we'll generate & add the card
				$(suitsDIV).append(myBeginHTML + nCard + myEndHTML);//

				// Position the card in the stack...
				myNewID = "#dummy" + nCard;
				nTopPosition = j * 40;
				$(myNewID).css({ "top": nTopPosition, "z-index": 2});
				
				// Make the card able to drag, but ONLY to the right area of the screen...
				// FUTURE would love to make 'em NONdraggable if it's not Dummy's turn (ditto 
				// for player's cards...)
				// Found this on Stack Overflow for determining drop zone...
				$(myNewID).draggable({ 
					revert:  function(dropped) {
					   var dropped = dropped && dropped[0].id == "whatDummyPlayed";
					   if(!dropped) alert("You must drop the card in the right area, when it is this hand's turn to play!");
					   return !dropped;
					}
				});
				
				// Set the card's rank
				myHTML = hand[ thisSuitID ][ j ];
				// ...and the image for the suit...
				myHTML += "<img src='images/";
				myHTML += theSuits[thisSuitID][ IMG_ID_INDEX ] + ".png'/>";
				// Display the card !
				$(myNewID).html( myHTML );
				
				nCard++;
			}
		}
	};
	
	//
	// This function takes a hand as input, and displays it in the player's hand area
	//
	var display_my_hand = function( hand ) {
		// so we will go through the hand, display each card.
		var nCard = 0;
		//var nTopPosition = 0;
		var myNewID = "";
		var theDIV = "";
		var thisSuitID = "";
		var myBeginHTML = "<div id='myPlay" 
		var myEndHTML = "' class='singleCard cardIsMine'></div>";
		var myHTML = "";		// used for writing the new card 
		
		// KEY HERE: gotta DELETE the existing cards, so we can re-create them
		// with the same ids [dummy0, dummy1 etc.]
		$("#myCardHolder").empty();
		
		// Get INT value of 1/13th of our card div
		var newWidth = $("#myCards")[0].offsetWidth;		// get my card's div width (in pixels)
		newWidth = newWidth / 14;	// tried 13, but need some leeway...
		var intvalue = Math.floor( newWidth );
		newWidth = intvalue;
		
		// For each suit within the hand: 
		// VERY important here... ALWAYS walk the hand in the SAME suit order!
		for ( var i=0; i < theSuitIDs.length; i++) {
			thisSuitID = theSuitIDs[i];		// Suit is the key in the key/value pair
			var cardsInSuit = hand[ thisSuitID ];
			
			// NOW, for each CARD within the suit....
			for (var j=0; j < cardsInSuit.length; j++) {
				// Find div where we'll be adding this suit
				theDIV = "#myCardHolder";
				// Now we'll generate & add the card
				$(theDIV).append(myBeginHTML + nCard + myEndHTML);//

				// Position the card in the stack...
				myNewID = "#myPlay" + nCard;
				$(myNewID).css( "width", "" + newWidth + "px");
				
				// NOW, set a global variable for the card width...we'll need this for lefty/righty
				currentCardWidth_GLB = newWidth;
				
				// Make the card able to drag, but ONLY to the right area of the screen...
				// Found this on Stack Overflow for determining drop zone...
				$(myNewID).draggable({ 
					revert:  function(dropped) {
					   var dropped = dropped && dropped[0].id == "whatIplayed";
					   if(!dropped) alert("You must drop the card in the right area, when it is this hand's turn to play!");
					   return !dropped;
					}
				})
				
				// Set the card's rank
				myHTML = hand[ thisSuitID ][ j ];
				// ...and the image for the suit...
				myHTML += "<img src='images/";
				myHTML += theSuits[thisSuitID][ IMG_ID_INDEX ] + ".png'/>";
				// Display the card !
				$(myNewID).html( myHTML );
				
				nCard++;
			}
		}
		
		// IF we still have at least one card in our hand, add some padding to center?!?!#$!?
		// So for each card FEWER than 13, add 1/2 of the cardWidth as a left margin...
		if ( nCard > 0 ) {
			var missingCards = (13 - nCard);		// remember 0-based... so AFTER loop, we're up to 13
			var newMargin = (newWidth * 0.50) * (missingCards+1);	// tried 13, but need some leeway...
			var intMargin = Math.floor( newMargin );
			$("#myCardHolder").css( "margin-left", "" + newMargin + "px");
		}
				
	};

	//
	// Displays a card led/played by a defender.
	//
	// player is either "Lefty" or "Righty"
	// myLead is an array with a suit & a rank:  e.g. ["C","4"] to lead the club 4
	//
	var display_defenders_card = function( player, myLead) {
		// Get INT value of 1/13th of our card div
		var newWidth = currentCardWidth_GLB;
		var mySuit = myLead[0];
		var myRank = myLead[1];
		var theDIV = "";
		var myNewID = "";
		var myBeginHTML = "<div id='";
		var myHTML = "";		// used for writing the new card 

		// KEY HERE: gotta DELETE the existing cards, so we can re-create them
		// with the same ids [dummy0, dummy1 etc.]
		if ( LEFTY == player) {
			theDIV = "#LeftysCard";
			$(theDIV).empty();
		} else { 
			theDIV = "#RightysCard";
			$( theDIV ).empty();
		}
		// e.g.: <div id='LeftysPlay' class='sinleCard cardIsLeftys'></div>
		myHTML = "<p>" + player + ": </p>";
		myHTML += myBeginHTML;
		myHTML += player;
		myHTML += "sPlay' class='singleCard cardIs";
		myHTML += player;
		myHTML += "s'></div>";
		$(theDIV).append(myHTML);
		
		// Position the card in the stack...
		myNewID = "#" + player + "sPlay";
		$(myNewID).css( "width", "" + newWidth + "px");
		
		// Set the card's rank
		myHTML = myRank;
		// ...and the image for the suit...
		myHTML += "<img src='images/";
		myHTML += theSuits[mySuit][ IMG_ID_INDEX ] + ".png'/>";
		// Display the card !
		$(myNewID).html( myHTML );
	};
	
	//
	// This function builds the array for the hand, given the text input for 13
	// cards to be held in one hand: eg SAKQHT98C432DAKQJ is 3343, with 4 diamonds
	//
	var build_hand_object = function( hand, player) {
		var suitCards = [];		// the suits cards is the array of cards:  eg ["A","K","Q","T","9"]
		var suitsFound = 0;
		var current = "";
		var currSuit = "";
		var foundCardInSuit = false;
		var currHand = {};
		
		for (var i=0; i < hand.length; i++ ) {
			current = hand[i];
			if ( current.match(/[SHDC]/i) ) {
				if (suitsFound > 0 ) {
					currHand[currSuit]= suitCards;	// assign a hand.S, hand.H, hand.C, hand.D to the object
					suitCards = [];		// reset the suit for the next one....
				}
				// Found the start of a new suit
				currSuit = current;
				foundCardInSuit = false;
				suitsFound++;		// we have found at least one suit, now, even if it was void
			} else {
				// we've found a card within the current suit
				suitCards.push( current);
			}
		}
		// Now, we have the entire hand, and must push the last suit...
		currHand[currSuit]= suitCards;
		
		currHand['Player'] = player; 	// should we have the player's name in here too?
		//currHand['cardsIn'] = 13;	// should we track how many cards left?
		return currHand;
	};
	
	//
	// This function actually loads up the hand arrays...
	// Ideally these would come from a database, or some other storage (couchDB anyone?)
	//
	var load_up_hands = function() {
		// CGM: Hand #07  [6/5/13 Rainbow]
		var hand01 = {	"Dummy":	"ST63HADAQ98763C76",
						"Righty":	"S72H9653DJT2CK985",
						"You":		"SAKQ84HKJ2DKCAQJ2",
						"Lefty":	"SJ95HQT874D54CT43",
						"CanMake":	"7NT"};
		// CGM: Hand #01  [6/5/13 Rainbow]
		var hand02 = {	"Dummy":	"SAJ97HT7DA952CJ64",
						"Righty":	"SKT865HA8542D64C3",
						"You":		"SQ3HKQ3DQCAQT9872",
						"Lefty":	"S42HJ96DKJT873CK5",
						"CanMake":	"3NT"};
		// CGM: Hand #14  [6/5/13 Rainbow]
		var hand03 = {	"Dummy":	"SJ5HQT942DJCAK973",
						"Righty":	"SQ4HK875DK865CQ62",
						"You":		"SAT76HJ63DAQT93C8",
						"Lefty":	"SK9832HAD742CJT54",
						"CanMake":	"2NT"};
		// CGM: Hand #29  [6/5/13 Rainbow]
		var hand04 = {	"Dummy":	"SJ42HAK852CQTDKQ6",
						"Righty":	"SKT75H943D974CAK2",
						"You":		"HJ76DAJT32CJ6SA86",
						"Lefty":	"SQ93HQTD85C987543",
						"CanMake":	"1NT"};
		// CGM: Hand #03  [6/5/13 Rainbow]
		// Freaky long clubs... 
		var hand05 = {	"Dummy":	"S752HJDCAKQJ98543",
						"Righty":	"ST983HK85DAK976CT",
						"You":		"SAK6HAQT42DQ854C7",
						"Lefty":	"SQJ4H9763DJT32C62",
						"CanMake":	"5NT"};
		// CGM: Hand #04  [6/5/13 Rainbow]
		var hand06 = {	"Dummy":	"SAQT985HKTDT82CK5",
						"Righty":	"SKJ7HADQJ974CAT97",
						"You":		"S42H752DAK65CQ863",
						"Lefty":	"S63HQJ98643D3CJ42",
						"CanMake":	"1NT"};
		// CGM: Hand #09  [6/5/13 Rainbow]
		var hand07 = {	"Dummy":	"SQT965H98DK2CQJT9",
						"Righty":	"S32HAQJ7542DQ6C54",
						"You":		"SA84HK63DJ954CAK3",
						"Lefty":	"SKJ7HTDAT873C8762",
						"CanMake":	"3NT"};
		// CGM: Hand #13  [6/5/13 Rainbow]
		var hand08 = {	"Dummy":	"SAJT85HA3DA54CAKQ",
						"Righty":	"S972HKQ975DJT7C85",
						"You":		"S6HJ2DKQ98632C973",
						"Lefty":	"SKQ43HT864DCJT642",
						"CanMake":	"6NT"};
		// CGM: Hand #15  [6/5/13 Rainbow]
		var hand09 = {	"Dummy":	"S72HKJT642DAJ9C84",
						"Righty":	"SQHQ8DK8532CAQJ73",
						"You":		"SAK984HADQ74CT952",
						"Lefty":	"SJT653H9753DT6CK6",
						"CanMake":	"1NT"};
		// This is a crazy non-statistical example...
		var hand10 = {	"Dummy":	"SHDAKQJT98765432C",
						"Righty":	"SAKQJT98765432HDC",
						"You":		"SHCAKQJT98765432D",
						"Lefty":	"SHAKQJT98765432DC",
						"CanMake":	"7C/D"};

		var theHands = [];		// start with an empty array
		theHands.push( hand01);
		theHands.push( hand02);
		theHands.push( hand03);
		theHands.push( hand04);
		theHands.push( hand05);
		theHands.push( hand06);
		theHands.push( hand07);
		theHands.push( hand08);
		theHands.push( hand09);
		theHands.push( hand10);
		
		// Load up the requested hand... 			
		var handID = ( $("#selectHand").val());
		alert("Starting a NEW game with hand # " + handID + "!");
		var arrayIndex = parseInt(handID, 10); 
		var entireHand = theHands[ arrayIndex - 1 ];	// zero-based...
		setup_global_hands( entireHand);		// This line loads up our global hand variables
		
		// Pull what the hand can make ("double dummy") 
		var canMake = entireHand.CanMake;
		$("#handCanMake").text( "Makes: " + canMake);
		
		/* FOR TESTING empty hand...
		for (var k=0; k<13; k++) {
			remove_card_from_hand( leftysHand, 0);
		} */
		set_debug_text( leftysHand_GLB, "leftysCards");		
		set_debug_text( rightysHand_GLB, "rightysCards");	
	};
	
	//
	// leftysHand_GLB & rightysHand_GLB are populated... add 'em to the debug text
	//
	var set_debug_text = function( hand, debugID) {
		var foundSuitAlready = false;
		var foundCardAlready = false;
		var thisSuitID = "";	// tracks the suits as we walk the hand
		var currText = "";		// used for appending text to debug elements
		var currHTML = "";		// used for appending text to debug elements
		var debugSelector = "#" + debugID;	// Identifys debug element to update
		
		// walk the hand...
		for ( var i=0; i < theSuitIDs.length; i++) {
			thisSuitID = theSuitIDs[i];		// Suit is the key in the key/value pair
			var cardsInSuit = hand[ thisSuitID ];
			//KLUDGEvar cardsInSuit = hand.thisSuitID;

			// If this is NOT the first suit, add a break to the <p> text
			if ( foundSuitAlready) {
				currHTML = $(debugSelector).html()
				currHTML += "<br />";
				$(debugSelector).html(currHTML);
			} else {
				$(debugSelector).html(debugID + ": <br />");		// must reset the debug text
			}
			if ( !foundSuitAlready) { foundSuitAlready = true; }
			currHTML = $(debugSelector).html();
			currHTML += thisSuitID + ": ";
			$(debugSelector).html( currHTML);
			
			// NOW, for each CARD within the suit....
			for (var j=0; j < cardsInSuit.length; j++) { 
				if ( !foundCardAlready) { foundCardAlready = true; }	// found at least one card...
				// Add this card to the debug paragraph
				currHTML = $(debugSelector).html();
				currHTML += cardsInSuit[j];
				$(debugSelector).html(currHTML);
			}
		}
		if ( !foundCardAlready ) {
			// the entire hand is void!
			//$(debugSelector).text("No cards left!");
			$(debugSelector).html(debugID + " has NO cards left!");
		}
	};

	// Just another layer to help with logistics of loading up the hands..
	var setup_global_hands = function( entireHand ) {
		// Set the global arrays for each player's hand...
		myHand_GLB = build_hand_object(  entireHand['You'], 'You');
		dummysHand_GLB = build_hand_object( entireHand['Dummy'], 'Dummy' );
		rightysHand_GLB = build_hand_object( entireHand['Righty'], 'Righty' );
		leftysHand_GLB = build_hand_object( entireHand['Lefty'], 'Lefty');
	};
		
		
	return bridgeApp;
})();

// This function is called when the HTML file is loaded up in the browser.
$(document).ready(function() {'use strict';
	new CGMApp.own.bridgeGame();
});

