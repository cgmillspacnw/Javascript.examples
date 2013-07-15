/*jshint devel: true, browser: true, jquery: true, strict: true */
/*global App: false */

CGMApp.own.Main = (function() {'use strict';

    var that = {};
    
    // Application Constructor
    function Main() {        
        console.log("debug: App constructor called");
    	that.util = new CGMApp.own.Utilities();
        bindEvents();
    }

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
        //var util = new CGMApp.own.Utility();
        $("#curDate").html("Current Date: " + that.util.getToday());
    };

    return Main;
})();

// 20130319 TEST 2: uncomment this:
$(document).ready(function() {"use strict";
    new CGMApp.own.Main();
});

