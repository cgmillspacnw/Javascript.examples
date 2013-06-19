/**
 * @author craig.mills
 * From a framework taught by Charlie Calvert
 * DMA 265 FINAL PROJECT
 June, 2013
 
 A bridge-playing website, based upon the "module" pattern.
 
 This source file is for the defender logic, to determine which cards to play and
 to decide what to discard when it comes to it.  
 
 The A.I. in this file is VERY rudimentary at this point.... in future I could script
 it for specific hands, or I could make it more robust and actually try to follow some
 guidelines.  
   
 */
/*jshint jquery:true, browser: true */

CGMApp.own.playAI = (function() { 'use strict';

	// Note: we artificially put in a 14 rank for 'find lowest card' logic...
	var theRanks = { 	"z": 14, "A": 13, "K": 12, "Q": 11, "J": 10, "T": 9, "9": 8,
						"8": 7, "7": 6, "6": 5, "5": 4, "4": 3, "3": 2, "2": 1 } 
	var theSuitIDs = ["S","H","C","D"];		// these are the indexes into the hand's cards themselves
	var LEFTY = "Lefty";
	var RIGHTY = "Righty";	// ??? why have to dupe here!  There's gotta be a way to 'include'...

	// This is the CONSTRUCTOR... this is called when an instance of this library is instanced.
	function playAI() {
	}
	
	//
	// Public method to select a card to lead
	// Returns AN ARRAY for the card being led: e.g. ["S","J"]  if holding is AKQJ... of spades 
	//
	playAI.prototype.find_a_lead = function( hand ) {
		var mySuit = "";	// the suit of card found
		var myLead = [];
		mySuit = find_longest_suit( hand);		// Find longest suit
		
		// >= 4?  If so, 4th down
		if ( hand[ mySuit ].length > 3) {
			myLead.push(mySuit);
			myLead.push( hand[ mySuit ][3]);		// REMEMBER: 0-based!
		} else {
			// Otherwise, simply top card in longest suit
			// FUTURE here I could search for 'top of a sequence' or 'low from an honor' etc.
			myLead.push(mySuit);
			myLead.push(hand[ mySuit ][0]);
		}
	
		return myLead; 
	};
	
	//
	// Public method (adding to the prototype) so we can call it from
	// outside this object.
	playAI.prototype.play_a_card = function( hand, previouslyPlayed) {
		var playersAlready = previouslyPlayed.length;
		var myCard = [];
		var cardsInSuit = 0;	// how many cards we have in this suit
		var suitToFollow = "";
		suitToFollow = previouslyPlayed[0][1][0];		// suit of the card from the FIRST element of prevPlayed
		
		cardsInSuit = hand[ suitToFollow ].length;
			
		switch ( playersAlready) {		// our logic depends upon how many others have played to the trick...
			case 0:
				alert("WHY are we here? we should be LEADing, not PLAYing a card...");
				myCard = find_a_lead(hand);		// we're the first to play to the trick!
				break;
			case 1:		// 2nd hand low...
				if ( cardsInSuit > 0 ) {
					// With doubleton, play TOP card to un-block!
					if ( cardsInSuit < 3) {		// with 1 or two cards, just play HIGHEST
						myCard.push(suitToFollow);
						myCard.push( hand[suitToFollow][0] );
					} else { 	
						myCard.push(suitToFollow);
						myCard.push( hand[suitToFollow][ cardsInSuit - 1 ]);		// 0-based
					}
				} else {
					myCard = find_a_discard( hand, previouslyPlayed );
				}
				break;
			case 2:		// 3rd hand high...
				// FUTURE here we could modify behavior based upon what is seen in dummy, if we're Lefty??
				if ( cardsInSuit > 0 ) {
					myCard.push(suitToFollow);
					myCard.push( hand[suitToFollow][ 0 ]);	// 0-based: this is HIGHEST ranked card in suit
				} else {
					myCard = find_a_discard( hand, previouslyPlayed);
				}
				break;
			case 3:		// 4th hand: take the trick w/lowest card, UNLESS pard has already won trick
				if ( cardsInSuit > 0 ) {
					var myPlayer = hand['Player'];
					var myPard = "";
						
					if ( cardsInSuit < 2 ) {		// only ONE card in the suit...play it	
						myCard.push(suitToFollow);
						myCard.push( hand[ suitToFollow ][0]);
					} else {	
						// we have more than 1 card in the suit...
						if (LEFTY == myPlayer) { 
							myPard = RIGHTY;
						} else {
							myPard = LEFTY;
						}
						// Has pard taken trick?  
						if ( myPard == this.who_won_the_trick( previouslyPlayed)  ) {
							var myRank = cardsInSuit[cardsInSuit.length - 1];		// REMEMBER 0-based!
						} else {
							myCard = take_the_trick( hand, previouslyPlayed);	
						}
					}
				} else {
					myCard = find_a_discard( hand, previouslyPlayed);
				}
				break;
		}
		
		return myCard;
	};	

	//
	// This function returns the player's id: Lefty, Dummy, Righty, or You, based
	// upon who won the trick.  This way we can set the next-to-play values.
	// 
	// RETURNS: a string containing the player who WON the trick, so that we can 
	// tally up the tricks won/lost, and set next lead
	playAI.prototype.who_won_the_trick = function( previouslyPlayed ) {		//, trumpSuit) {	// FUTURE: trump suit...
		// So FOR NOW we're in notrump...whichever suit was led can't be trumped
		var suitLed = "";		// this will be the suit of the first card led...
		var highRank = "";
		var playerWinning = "";		// will be updated with player to trick currently "winning"
		var thisSet = [];	// Array holding [player, [card]] as we walk the trick: thisCard[0]=player, [1][0]=suit, [1][1]=rank
		var thisRank = "";
		var thisSuit = "";
		var thisPlayer = "";
		//var trumpSuit = "";		// FUTURE?
		
		// Walk the 4 (?? always? maybe use this as a utility function?) cards played to the trick, to see who won
		for (var i=0; i < previouslyPlayed.length; i++) {		// start at ONE: we got initial 
			thisSet = previouslyPlayed[i];	// [0]:player, [1]= ["Suit","Rank"] so [1][0]==suit, [1][1]==rank
			thisPlayer = thisSet[0];
			thisSuit = thisSet[1][0];
			thisRank = thisSet[1][1];
			
			if ( 0 == i) {		// for first player: they're winning so far
				suitLed = thisSuit;
				highRank = thisRank;
				playerWinning = thisPlayer;
			} else {		// some work to do....
				//[ "You", ["S","J"] ]
				if ( suitLed == thisSuit) {		// DON'T bother if they didn't follow suit...
					if ( theRanks[thisRank] > theRanks[highRank] ) {
						// this card beats the 
						highRank = thisRank;
						playerWinning = thisPlayer;
					}
				} //else { }	// FUTURE: handle a trump suit? pass it in as an arg?
			}
		}
		return playerWinning;
	};
	
	//
	// We can't follow suit...pitch your lowest card...
	var find_a_discard = function( hand, previouslyPlayed) {
		var myCount = count_cards_in_hand( hand);
		var myCard = [];
		
		var myRandom = Math.floor((Math.random()*myCount));
		
		// FUTURE this really, really oughta be fixed.... who would discard the ace of spades, e.g.??
		// OK for now, just generate a random discard... could be funny!
		//myCard = get_nth_card_in_hand( hand, myRandom);
		
		// Wow... let's fix this NOW... 
		// UNCOMMENT ME for in-class demo....
		myCard = find_lowest_card_in_hand( hand);		
		
		return myCard;
	};
	
	//
	// Walk the suits in the hand, and find the LOWEST card to dispose of...
	// 
	var find_lowest_card_in_hand = function( hand) {
		var mySuitID = "";
		var myCard = ["","z"];	// ensure that ANY card found will be LOWER RANKED than default
		
		for ( var i=0; i < theSuitIDs.length; i++) {
			mySuitID = theSuitIDs[i];		// Suit is the key in the key/value pair
			var cardsInSuit = hand[ mySuitID ].length;

			// NOW, for each suit....
			if ( cardsInSuit > 0 ) {		// if this suit's card is LOWER than stored one, use it instead
				if ( theRanks[hand[ mySuitID ][ cardsInSuit - 1]] < theRanks[myCard[ 1 ]] ) {
					myCard[0] = mySuitID;
					myCard[1] = hand[mySuitID][ cardsInSuit - 1 ];		// REMMEBER zero-based !
				}
			}
		}
		if ( "" == myCard[0] ) {
			// somehow there are NO cards in the hand??  
			alert( "Trying to discard from an EMPTY HAND?!?");
		} 
		return myCard;
	};
	
	//
	// Play the highest card that you can, to try to take the trick
	//
	var take_the_trick = function( hand, previouslyPlayed) {
		var myCard = [];
		var previousCard = [];
		var myPard = "";		// we'll fill this in...
		
		var currRank = "";
		var currSuit = "";
		var winningRank = "2";		// this default COULD stay, if they're running a long suit
		var ourTopRank = "2";
		var theirTopRank = "2";
		var myCardsInSuit = 0;		// default to 0 cards in the suit led
		var toppedTheirRank = false;		// if we don't find one, we'll need to just play low...
		
		if ( LEFTY == hand['Player'] ) {
			myPard = RIGHTY;
		} else {
			myPard = LEFTY;
		}
		// Look at highest previously played cards...
		var suitToFollow = previouslyPlayed[0][1][0];
		myCardsInSuit = hand[suitToFollow].length;
		
		// If we're OUT of this suit, just discard...
		if ( myCardsInSuit < 1 ) {
			myCard = find_a_discard( hand, previouslyPlayed);
		} else {
			if ( myCardsInSuit < 2 ) {		// last card in suit...gotta play...
				myCard.push(suitToFollow);
				myCard.push( hand[suitToFollow][0]);
			} 
			else {			// we have at LEAST two cards in the suit....
				// walk the previously-played cards, to see what we should play...
				for (var i=0; i < previouslyPlayed.length; i++) {
					previousCard = previouslyPlayed[i];
					//[ "You", ["S","J"] ]
					if ( suitToFollow == previousCard[1][0]) {		// DON'T bother if they didn't follow suit...
						if ( myPard == previousCard[0] ) {
							ourTopRank = previousCard[1][1];	// pard's card...
						} else {
							// this was NOT pard's card... was it higher ranking?
							currRank = previousCard[1][1];		// current card's rank being analyzed
							if ( theRanks[currRank] > theRanks[theirTopRank] ) {
								theirTopRank = currRank;
							}					
						}
					}
				}
				if ( theRanks[ourTopRank] > theRanks[theirTopRank] ) {
					// pard is winning the trick, just play low
					myCard.push(suitToFollow);
					myCard.push( hand[suitToFollow][ myCardsInSuit - 1 ]);
				} else {
					var myLowestRank = "";
					// one of the opponents' cards is highest...try to take it...
					for (var j=myCardsInSuit-1; j >= 0; j--) {		// AUUUUUGGGGHH zero-based...
						// starting with lowest ranking card in suit, try to take the trick
						myLowestRank = hand[suitToFollow][ j ];
						if ( theRanks[myLowestRank] > theRanks[theirTopRank] ) {
							// win it with this card!
							myCard.push( suitToFollow);
							myCard.push( myLowestRank);
							toppedTheirRank = true;
							break;
						}
					}
					if ( !toppedTheirRank ) {	// Couldn't top o's card, but DO have cards in the suit...
						// UNCOMMENT ME 
						//myCard = find_a_discard( hand, previouslyPlayed);
						myCard.push( suitToFollow);
						myCard.push( hand[suitToFollow][ myCardsInSuit - 1] );
					}
				}
			}
		}
		return myCard;
	};
	
	//
	// This is just for our "random play" AI..
	//
	var count_cards_in_hand = function( hand) {
		var myCounter = 0;		// start at the beginning of the hand...
		var myCard = {};		// this will be returned:  e.g. { H: "7" } to return the heart 7
		var mySuitID = "";	
		
		for ( var i=0; i < theSuitIDs.length; i++) {
			mySuitID = theSuitIDs[i];		// Suit is the key in the key/value pair
			var cardsInSuit = hand[ mySuitID ];
			
			// NOW, for each CARD within the suit....
			for (var j=0; j < cardsInSuit.length; j++) { 
				myCounter++;	// we have not found the card yet... keep goin'
			}
		}
		return myCounter;
	};
	
	//
	// This gets say the 4th card in the hand... just to pull a random card...
	// Returns an array: ["S","K"] for example to return the spade King 
	// 
	// IMPORTANT: ASSUMES THAT THERE ARE AT LEAST AS MANY CARDS LEFT IN THE HAND
	// AS (THE INDEX + 1)  (Remember: zero-based).  ERRORS WILL HAPPEN if you try
	// to get the index 11th card, and there are ONLY 11 cards (0-10) in the hand!
	//
	var get_nth_card_in_hand =  function( hand, cardIndex) {
		var myCounter = 0;		// start at the beginning of the hand...
		var mySuitID = "";
		var myCard = [];		// this will be returned:  e.g. [ "H", "7" ] to return the heart 7
		
		// !! Gotta go through the suits in the RIGHT, KNOWN order!  
		for ( var i=0; i < theSuitIDs.length; i++) {
			mySuitID = theSuitIDs[i];		// Suit is the key in the key/value pair
			var cardsInSuit = hand[ mySuitID ];
			
			// NOW, for each CARD within the suit....
			for (var j=0; j < cardsInSuit.length; j++) { 
				if ( myCounter == cardIndex) {
					myCard.push(mySuitID);
					myCard.push(cardsInSuit[ j ]);
					// now return the new hand....
					return myCard;
				}
				myCounter++;	// we have not found the card yet... keep goin'
			}
		}
		// Error handling??? Didn't find the card?  Could get ugly...
		// But "should" NEVER get to this line.... and we'll get the 'undefined' error
		// downstream when/if this happens...??
		alert( "Did not find card of index " + cardIndex + " in the hand!");	
	};	
	
	//
	// Find the longest suit in a hand... tie goes to first suit w/that number
	// Returns a character identifying the suit.
	//
	var find_longest_suit = function( hand) {
		var thisSuit = "";			// the current suit
		var thisSuitID = "";
		var longestSuit = "";		// stores resulting longest suit
		var longestSuitCount = 0;	// how many cards in current longest suit
		
		// For each suit within the hand: 
		// VERY important here... ALWAYS walk the hand in the SAME suit order!
		for ( var i=0; i < theSuitIDs.length; i++) {
			thisSuitID = theSuitIDs[i];		// Suit is the key in the key/value pair
			var numberInSuit = hand[ thisSuitID ].length;
			if ( numberInSuit > longestSuitCount ) { 
				longestSuit = thisSuitID;
				longestSuitCount = numberInSuit;
			}
		}
		return longestSuit;
	};
	
	
	return playAI;
})();

