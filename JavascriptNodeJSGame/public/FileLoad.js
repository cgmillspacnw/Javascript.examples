/**
 * @author cgm pillaged shamelessly from Charlie Calvert
 */

CGMApp.own.FileLoad = (function() {
	
	// Constructor
	function FileLoad() {
	}
	
	// Private method
	var saveTraits = function(traits, mySelector, tester) {
		var mySelector = "";
		
		if (traits.Type.indexOf('Orc') !== -1) {
			CGMApp.run.characters.Orc = traits;
			mySelector = "#foeTable";
		} else if (traits.Type.indexOf('Hero') !== -1) {
			CGMApp.run.characters.Hero = traits;
			mySelector = "#heroTable";
		}
		CGMApp.run.characters.createCharacterTable(traits, mySelector);
		if (typeof tester !== "undefined") {
			tester(traits);
		}
	};
	
	// Public method...
	FileLoad.prototype.getCharacters = function(fileName, selector, tester ) {
	//	$('#debugGrid').html("Get Characters called");
		request = $.ajax({
			type : "get",
			//url : '/getCharacterStats',
			url : fileName,		// NOW just read the given file...
			cache : false,
			dataType : "json",
			success : function(data) {
				var myData = data;
				//console.log(data);
				saveTraits( data, selector, tester);	
				CGMApp.run.draw.displayCharacterStats();
				$('#debug').html("");
			},
			error : showError
		});
	};
	
	//
	// NEW: now read JSON from couchDb!
	//
	FileLoad.prototype.readDBJson = function( filename, selector, tester ) {
		//showDebug('ReadJson called with: <strong>' + filename + '</strong>');
		var app = new CGMApp.own.AjaxBase();
		app.readJson( filename, 
			function(data) {	// success function...
				try {
					var result = JSON.stringify(data);	// stringify, since from DB!
					saveTraits( data, selector, tester);
					CGMApp.run.draw.displayCharacterStats();
					
					//showDebug(result);
				} catch(err) {
					showDebug(err);
				} 
		},
		function(request, ajaxOptions, thrownError) {
			showDebug(request.responseText);
		});
	};
	
	FileLoad.prototype.writeDBJson = function( filename, myData, tester ) {
		showDebug('WriteDBJson called with: <strong>' + filename + '</strong>');
		var app = new CGMApp.own.AjaxBase();
		app.writeJson( filename, myData, 'GET', 
			function(data) {		// success function
				try {
					var result = JSON.stringify(data);	// stringify, since from DB!
					//showDebug(result);	???Really should show??
				} catch(err) {
					showDebug(err);
				} 
		},
		function(request, ajaxOptions, thrownError) {
			showDebug(request.responseText);
		});
	};
		
	// errored
	var showError = function(request, ajaxOptions, thrownError) {
		//$('#debug').html("ERROR getting characters");
		CGMApp.run.display.showDebug("Error occurred: = " + ajaxOptions + " " + thrownError);
		CGMApp.run.display.showDebug(request.status);
		CGMApp.run.display.showDebug(request.statusText);
		CGMApp.run.display.showDebug(request.getAllResponseHeaders());
		CGMApp.run.display.showDebug(request.responseText);
	};
	
	var showDebug = function(value) {
		$('#debugList').append('<li>' + value + '</li>');
	};

	// return Constructor
	return FileLoad;
})();
