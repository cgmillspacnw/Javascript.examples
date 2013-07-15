/*jshint devel: true, browser: true, jquery: true, strict: true */
/*global App: false */

/* This handles the Phonegap app */
CGMApp.own.Main = (function() {'use strict';

    var that = {};
    
    // Application Constructor
    function Main() {        
        console.log("debug: App constructor called");
    	// This MUST be done here, so it runs on doc ready (so HTML exists!)
    	that.display = new CGMApp.own.Display();
    	that.display.showOrHideDirections(false);
    	that.util = new CGMApp.own.MapUtils();
    
        bindEvents();
    }
	
	// These CANNOT be here... have to await HTML load.
	//that.util = new CGMApp.own.MapUtils();
	//that.util.showOrHideDirections(false);	/* Hide the "directions" div for now...
	
    /*     
     * Bind any events that are required on startup. 
     * Common events: 'load', 'deviceready', 'offline', and 'online'. 
    */
    var bindEvents = function() {
        console.log("debug: App bindEvents called");
        document.addEventListener('deviceready', onDeviceReady, false);
    };

    // Called when device is fully initialized   
    var onDeviceReady = function() {
        console.log("debug: App onDeviceReady called");        
        showProgramState();                
        showDate();
    };

    var showProgramState = function() {
        var listeningElement = $('.listening');
        var receivedElement = $('.received');
        listeningElement.attr('style', 'display:none;');
        receivedElement.attr('style', 'display:block;');
    };
    
    var showDate = function() {
        console.log('debug: showDate called');
        $("#curDate").html("Current Date: " + that.util.getToday());
    };

    return Main;
})();

$(document).ready(function() {"use strict";
    new CGMApp.own.Main();		// This launches the constructor, which can access the (now-present) HTML
});

