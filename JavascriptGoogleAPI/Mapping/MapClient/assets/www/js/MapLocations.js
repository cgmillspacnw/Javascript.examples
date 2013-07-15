/**
 * @author CGM from Charlie's archetypes
 */

CGMApp.own.MapCore = (function(displayInit, initUtilities) {

	var display = null;
	var locationMode = false;
	var selectedItem = '';
	var utilities = null;
	var locationsList = null;

	function MapCore(displayInit, initUtilities) {
		display = displayInit;
		utilities = initUtilities;
		// gotta have the button clicky calls here...
		$("#getLocations").click(this.getLocations);
		$("#insertLocation").click(this.insertLocation);
		$("#saveLocations").click(this.saveLocations);
		$("#deleteitem").click(this.deleteItem);
		$("#clearFields").click(display.clearFields);
		
	}

	var radioSelection = function() {
		selectedItem = $("input[name=responseGroup]:checked").attr('id');
		locationName = $("input[name=responseGroup]:checked").attr('locationName');
		latitudey = $("input[name=responseGroup]:checked").attr('latitude');
		longitudey = $("input[name=responseGroup]:checked").attr('longitude');
		describey = $("input[name=responseGroup]:checked").attr('description');
		
		$('#locationName').val(locationName);
		$('#latitude').val(latitudey)
		$('#longitude').val(longitudey);
		$('#description').val(describey);
	};

	var clearResponse = function(debugMessage) {
		locationMode = false;
		display.clearResponse();
		display.showDebug(debugMessage);
	};

	var showLocations = function(boolInserting) {
		display.clearResponse();
		var count = 0;
		var lastLocIndex = ($(locationsList).length - 1);	// remember: 0-based...
		$(locationsList).each(function() {
			$(this).each(function() {
				this.itemName = 'item' + count++;
				display.displayRow(this);
			});
		});
		// BUG FIX: if we're inserting, go ahead and check the radio button
		if ( boolInserting) {
			//$("input[name=responseGroup]:radio:last").attr('checked', true);
			$("input[name=responseGroup]:radio:last").attr('checked', true);
		}
	};

	MapCore.prototype.getLocations = function(callback) {
		try
		{
			
		//clearResponse("Get Locations called");	// for DEBUG only
		locationMode = true;
		
/*  THIS WORKS !  Hallelujah!		*/
		$.getJSON('http://54.225.197.186:30025/getLocations', function(data) {
			locationsList = data;
			showLocations(false);	// We're NOT inserting a new loc here..
			$('#responseGroup').change(radioSelection);
			$("input[name=responseGroup]:radio:first").attr('checked', true);
			radioSelection();
			if ( typeof (callback) == 'function') {
				display.showDebug("Callback coming");
				callback();
			}

		}).success(function() {
			console.log("cgm: success. Loaded MapLocation.json");
		}).error(function(jqXHR, textStatus, errorThrown) {
			//display.showError;		// call my error display
			display.showError(jqXHR, textStatus, errorThrown);
		}).complete(function() {
			console.log("cgm: completed call to get MapLocation.json");
		});
				
		
		/*  THIS POST DOES NOT WORK!  AAAAUGH!
		var data = {};
		var request = $.ajax({
			type : "POST",
			url : 'http://54.225.197.186:30025/getLocations',
			cache : false,
			dataType : "json",
			//data : data,
			success : function(json) {
				locationsList = json;
				showLocations(false);	// We're NOT inserting a new loc here..
				$('#responseGroup').change(radioSelection);
				$("input[name=responseGroup]:radio:first").attr('checked', true);
				radioSelection();
				if ( typeof (callback) == 'function') {
					display.showDebug("Callback coming");
					callback();
				}
			},
			error : display.showError
		});
		*/
		}
		catch (e)
		{
			alert("FAILED TRY!");
		}

	};
	
	MapCore.prototype.saveLocations = function() {
		var data = { details: 'locations', data: JSON.stringify(locationsList) };
		
		/*$.getJSON('http://54.225.197.186:30025/saveLocations', function(data) {
			display.showDebug(data.result);
		}).success(function() {
			console.log("cgm: success. Saved MapLocations.json");
		}).error(function(jqXHR, textStatus, errorThrown) {
			display.showError(jqXHR, textStatus, errorThrown);
		}).complete(function() {
			console.log("cgm: completed call to save MapLocations.json");
		});
		*/
/* THIS [PRESUMABLY] DOES NOT WORK */ 		
		$.ajax(
		{
			type: "POST",
			url: 'http://54.225.197.186:30025/saveLocations',
			dataType: "json",
			cache: 'False',
			data: data, 
			success: function(data) {
				display.showDebug(data.result);
			},
			error: display.showError			
		});	


	}

	function getLocInfo() {
		var locInfo = {};
		locInfo.locationName = $.trim($('#locationName').val());
		locInfo.latitude = $.trim($('#latitude').val());
		locInfo.longitude = $.trim($('#longitude').val());
		locInfo.description = $.trim($('#description').val());
		if (!utilities.readyForUpdate(locInfo.locationName, locInfo.latitude, locInfo.longitude)) {
			alert("Please enter all required fields: City, Latitude & Longitude");
			return null;
		}
		return locInfo;
	}

	MapCore.prototype.insertLocation = function() {
		locInfo = getLocInfo();
		if (locInfo) {
			insertRecord(locInfo.locationName, locInfo.latitude, locInfo.longitude, locInfo.description);
		}
	};

	var insertRecord = function(locationName, latitude, longitude, description) {
		//display.showDebug("Inserting city: " + locationName);
		//clearResponse('called putitem');
		var newLoc = new EasyMapLocation(locationName, latitude, longitude, description); // KLUDGE blank descrip for now...
		var query = newLoc.toJSON();
		locationsList.push(query);
		showLocations(true);	// We ARE IN FACT inserting a new loc here..
	};

	MapCore.prototype.deleteItem = function() {
		if (!locationMode) {
			alert("You must select Get Locations before trying to delete a location");
			return;
		}
		clearResponse('Called delete item: ' + selectedItem);
		query = "itemName=" + selectedItem;
		utilities.deleteFromArray2(locationsList, selectedItem);			
		showLocations(false);	// We're NOT inserting a new loc here..	
	};

/*	MapCore.prototype.clearFields = function() {
		$('#locationName').val("");
		$('#latitude').val("");
		$('#longitude').val("");
		$('#description').val("");
		
	}
*/	
	return MapCore;

})();

$(document).ready(function() {

	new CGMApp.own.MapCore(new CGMApp.own.Display(), new CGMApp.own.MapUtils());

});

