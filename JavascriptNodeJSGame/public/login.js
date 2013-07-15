/**
 * @author craig.mills
 * PROG 282  Week 03 Assignment: Draw Grid with OpenID login
 */
/*jshint jquery:true, browser: true */


var LoginUtils = (function() {
	
	// Constructor...
	function LoginUtils() {
		// CGM FIXME: have the user log in beforehand, and have the Game start
		// only AFTER they have logged in with a valid OpenID.  
		$('#inputty').click( authenticateUser());
		//makeImageData();
		//setFenceposts();	
		
	}

	// This function calls the server method to connect to myOpenID
	function authenticateUser() {
		var myUserName = $("#inputty").text();
		
		$.getJSON('/authenticate?user=' + getUserName(), function() {
		}).success(function() {
			console.log("csc: success. Loaded index.json");
		}).error(function(jqXHR, textStatus, errorThrown) {
			showError(jqXHR, textStatus, errorThrown);
		}).complete(function() {
			console.log("csc: completed call to get index.json");
		});
		
		return 
	}
	
	// This is a okay way to post data to the server
	// If you need to pass a lot of data, use POST,
	// as shown above.
	function launchGame() {
		$.getJSON('/launchGameFile?user=' + getUserName(), function() {
		}).success(function() {
			console.log("csc: success. Loaded index.json");
		}).error(function(jqXHR, textStatus, errorThrown) {
			showError(jqXHR, textStatus, errorThrown);
		}).complete(function() {
			console.log("csc: completed call to get index.json");
		});
	}

	return LoginUtils;
})();

$(document).ready(function() {'use strict';
	new LoginUtils();
});

