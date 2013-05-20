/*
DMA 265  Project 04: Quiz Show
Craig Mills
Completed:  May 7, 2013

This file accompanies the .HTML file to show a quiz about the game 
of chess.  The questions are fairly basic, but DO require an understanding
of the game in order to complete.

*/

var imageCache = [];
var listNode = null;
var captionNode = null;
var imageNode = null;
var quizCounter = 1;

var questionsNode = null;
var nextQuestion = null;
var buttonsNode = null;
var nextButton = null;
	
   
// This function runs when the button is clicked....
function clickButton() {
	var myButton = document.getElementsByName("startButton")[0];
	// FIXME maybe start a timer at this point, to tell them how fast they took to finish?
	$("#quizDisplay").toggle();
	
	if ( myButton.innerText.search("Start") != -1) {
		myButton.innerText = "Cancel the Quiz!";
		
		$("#questionsContainer").replaceWith( nextQuestion);
		
		//toggleQuiz(true);	// we DO want to START the show...start it
	} else {
		myButton.innerText = "Start the Quiz!";
		//toggleQuiz(false);		// we do NOT want to START the show...stop it
	}
	
	// now figure out HOW to put the buttons in...
	$("#buttonsContainer").empty();
	
	var myNumber = "";
	if ( quizCounter < 10) {
		myNumber = "0";
	}
	myNumber += quizCounter.toString();
	var myID = "#buttons" + myNumber;
	
	$("#buttonsContainer").replaceWith( $(myID));
	
	
	//$("buttonsContainer").wrap("<table></table>");
	
	
	nextButton = buttonsNode.next();
	
}


	
	
$(function(){
//window.onload = function () {
    
	questionsNode = $("#questions_list p");  
	nextQuestion = questionsNode.first();
	buttonsNode = $("#buttons_list");
	nextButton = buttonsNode.first();
	
//}
})


