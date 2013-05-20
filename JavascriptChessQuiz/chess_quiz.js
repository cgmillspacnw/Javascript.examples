/*
DMA 265  Project 05: Quiz Show w/Answer Tallying
Craig Mills
Completed:  May 19, 2013

This file accompanies the .HTML file to show a quiz about the game 
of chess.  The questions are fairly basic, but DO require an understanding
of the game in order to complete.

The total correct answers are tallied and displayed.  


OKAY RON:
I did not want the "right" answers being obviously in the text, for every user who
knows how to 'View Page Source'.  So I am a wee bit tricky, and actually load the
radio buttons from the HTML file 'questions.html'.  

They can still, in Chrome, go into the Developer pane and inspect the Elements to
find the 'right' answers... but at least it's a BIT more muddled.  I should load a 
JSON file with the questions and the answers, instead.  

If you want to run it WITHOUT running a web server, simply:
	1) Comment the line below which loads in the buttons from the questions.HTML file:
			(line #237)  $("#buttons_list").load('questions.html .buttonsList');
	2) Run the file 'index_with_questions.HTML' in the browser, INSTEAD of index.html.  
*/

var imageCache = [];
var questionsNode = null;
var nextQuestion = null;

var imageNode = null;

var quizCounter = 0;
var nextSlide = null;
var nextSlideSource = null;
var nextCaption = null;
var NUMBER_OF_QUESTIONS = 10;		// we have 10 questions (for now)
var totalCorrect = 0;		// start with 0 correct answers (out of numberOfQuestions)
var totalIncorrect = 0;		// start with 0 incorrect answers, too
   
// This function runs when the button is clicked....
function clickButton() {
	var myButton = document.getElementsByName("startButton")[0];
	// FIXME maybe start a timer at this point, to tell them how fast they took to finish?
	
	if ( myButton.innerText.search("Start") != -1) {
		myButton.innerText = "Cancel the Quiz!";
		toggleQuiz(true);	// we DO want to START the show...start it
	} else {
		myButton.innerText = "Start the Quiz!";
		toggleQuiz(false);		// we do NOT want to START the show...stop it
	}
}

/*
	This function verifies that one of the radio buttons has been 
	selected for the given question.  Use the nQuestion arg to determine
	the name for the radio group.
*/
function validateSelection( nQuestion ) {
	var myRadio = "quest";
	if ( nQuestion < 10) {
		myRadio += "0";
	}
	myRadio += nQuestion.toString();
	var myName = "#buttonsContainer + .buttonsList input[name='" + myRadio + "']";
	// Verify SOMETHING is selected in the group...
	var radioGroup = $( myName);
	var foundSelected = false;
	for ( var i=0; i < radioGroup.length; i++) {
		if ( radioGroup[i].checked) {
			foundSelected = true;
			// ...test whether answer has class "correct"?? or otherwise
			// check NOW for correct answer...
			if ( $(radioGroup[i]).hasClass('right')) {
			     totalCorrect++;
			} else {
				totalIncorrect++;
			}
			break;
		}
	}
	return foundSelected;
}

// When the user clicks the 'next question' button, we verify he's selected
// SOMEthing before moving on...
function nextQuestionClicked() {
	if ( ! validateSelection( quizCounter )) {
		alert("You must select an answer before you may move on!");
		return;
	}
	quizCounter++;
	loadNextQuestion();
}

// We will build this up later to actually send file/answers/grade etc.
function finishQuiz( messagey) {
	//alert(messagey);	// for debugging...
	
	var myMessage = "Thanks for taking the quiz!\n\nYou answered ";
	myMessage += totalCorrect.toString();
	myMessage += " correctly, and " + totalIncorrect.toString();
	myMessage += " incorrectly.\nYour score is: ";
	var myPercent = (totalCorrect / (quizCounter - 1)) * 100;
	myMessage += myPercent.toString() + "%.\n\n";
	
	if ( myPercent <= 40) {
		myMessage += "Back to the books for you!";
	} 
	else if ( myPercent < 80) {
		myMessage += "Nice try with it! You got at least half correct!";
	}
	else
	{
		myMessage += "Very nice score! You obviously know your chess!";
	}
	alert(myMessage);
	
	//$('#quizImage').hide('explode', {"pieces":45}, "slow");
	$('#caption').hide();
	$('#button_wrapper').hide();
	$('#nextQuestionButton').hide();
	$('#quizImage').show();
	$('#quizImage').attr("src", "Thanks for Playing.jpg");
	$('#quizImage').attr("alt", "Thanks for playing!");
	$('body').animate({opacity:'hide', ease: 'easeOut'}, 7500);
	//$('quizImage').animate({}, 3000);
	$('body').queue(function() {
		$(this).dequeue();
		initialize_quiz();	// DON'T go back to initial page until AFTER fadeout
	});
}

// bStartQuiz is an arg passed in to tell us whether to start or stop it.
//   true: start the quiz: begin displaying questions
//   false:  stop the show: hide the current image wtih the splash screen, and get rid of text & buttons
function toggleQuiz( bStartQuiz) {
    // Start the quiz....
	var image = null;
	
	if ( bStartQuiz) {
		if ( quizCounter <= 0) {
			quizCounter++; 		// start with question 1
			$("#caption").toggle();	// display the caption, too
			
			// Load up the first image, and the text...
			// The splash screen is the first image, so we need actually the 2nd child image...
			nextSlide = $("#image_list img:nth-child(2)");	
			nextQuestion = questionsNode[0];//.first();
			$("#quizDisplay").toggleClass("notVisible");		// need to show the quiz area...
			
			// We NEED these initially, since this is our FIRST TIME here..
			nextSlideSource = nextSlide.attr("src");
			nextCaption = nextSlide.attr("alt");
			nextTitle = nextSlide.attr("title");
			loadNextQuestion();
		} else {
			// We had previously started...there is a question set already loaded up...
			$("quizDisplay").toggleClass("notVisible");;
		}
	} else {
		// we're STOPPING the quiz....
		$("#quizDisplay").toggleClass("notVisible");		// hide the quiz so they can't study it while alert is up...
		$("#caption").toggle();
		nextSlide = $("#image_list img:first");
		
		$("#quizImage").attr("src", nextSlide.attr("src"));
		$("#quizImage").attr( {"alt": nextSlide.attr("alt"), "title": nextSlide.attr("title")});
		
		if ( quizCounter <= 0 ) {
			alert("So soon?  Thanks for considering it, anyway!");
		}
		quizCounter = 0;		// reset ...
		totalCorrect = 0;
		totalIncorrect = 0;
	}
}

// This gets the information for the next question...
function loadNextQuestion() {
	if ( quizCounter > NUMBER_OF_QUESTIONS) {
		finishQuiz(" via counter...");
	}
	// Now these need done for EVERY TIME we go to next....
	$("#quizImage").attr("src", nextSlideSource);
	$("#quizImage").attr( {"alt": nextCaption, "title": nextTitle });
	
	$("#questionsContainer").empty();
	$("#questionsContainer").append( nextQuestion);
	
	$("#caption").text( nextCaption );
	
	// now figure out HOW to put the buttons in...
	$("#buttonsContainer").empty();
	var myNumber = "";
	if ( quizCounter < 10) {
		myNumber = "0";
	}
	myNumber += quizCounter.toString();
	var myID = "#buttons" + myNumber;
	//$("#buttonsContainer").replaceWith( $(myID));
	//$("#buttonsContainer").html( clone($(myID)));
	
	$("#buttonsContainer").next().remove();
	
	// Now put the buttons for THIS question into the display area
	$(myID).clone().insertAfter( $("#buttonsContainer"));
		
	// NOW, we need to load up the info for the NEXT question...
	nextSlide = nextSlide.next();
	nextSlideSource = nextSlide.attr("src");
	nextCaption = nextSlide.attr("alt");
	nextTitle = nextSlide.attr("title");
	
	nextQuestion = questionsNode[ quizCounter ];
}

function initialize_quiz() {
	window.location.replace("./index.html");
	
	
}
// This is the jQuery shortcut "document ready" command.
$(function(){
//window.onload = function () {
    questionsNode = $("#questions_list p");    
    captionNode = $("#caption");
	var myImages = $("#image_list img");

	$("#nextQuestionButton").click( nextQuestionClicked);

	// Well, I tried this but was getting the "same origin not allowed" error.
	// So you have to have it running from a web server, e.g. from Eclipse, can't just
	// load index.html into Chrome or a browser to run....
	//$("#buttons_list").load('questions.html .buttonsList');
	
    // Pre-load all image links  
	var image = null;
    for ( var i = 0; i < myImages.length; i++ ) {
        // Preload image and copy title properties
        image = new Image();
        image.src = myImages[i].getAttribute("src");
        image.title = myImages[i].getAttribute("title");
        image.alt = myImages[i].getAttribute("alt");
		imageCache.push(image);
    }
//}
})
