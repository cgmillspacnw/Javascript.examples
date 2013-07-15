/**
 * @author cgm pillaged from Charlie Calvert
 */

CGMApp.own.Display = (function() {
	function Display() {
		
	}

	// For this to work, you need an unordered list in your HTML file
	Display.prototype.showDebug = function(data) {
		$("#debugList").append("<li>" + data + "</li>");
	};
	
	return Display;
})();
