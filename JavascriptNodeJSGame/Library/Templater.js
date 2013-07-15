/**
 * @author Charlie Calvert
 */

var fs = require('fs');
var handlebars = require('handlebars');

var Templater = (function() {
	'use strict';

	function Templater() {
	}

	// PLEASE NOTE that we convert the file to a string.
	var readHtml = function(fileName) {
		return String(fs.readFileSync(fileName));
	};

	// 
	// This function is used to combine the HTML files. You can pass in:
	// 		JUST the grid HTML (in contentName1)
	// 		JUST the test HTML (in contentName2)
	//		BOTH the grid & test (in contentName1, contentName2)
	//		
	//	In either case, you may include the customize code in contentName3, if you'd like. 
	//	(MOST of the time I will include this customizable pane...but need to CUSTOMIZE it)
	Templater.prototype.addContent = function( templateFile, myUsername, contentName1, contentName2, contentName3) {
		console.log('Templater with: ' + templateFile + ", " + myUsername + ", " 
			+ contentName1 + ", " + contentName2 + ", " + contentName3);
		
		var mainFile = readHtml( templateFile);
		
		debugger;
		var myContent1 = "";
		var myContent2 = "";
		var myContent3 = "";
		// For each part passed in, read the file IF NECESSARY
		//console.log("My mainFile is: " + mainFile);
		if ( contentName1 > "") {
			myContent1 = readHtml(contentName1);
			//console.log("My content1 is: " + myContent1);
		}
		if ( contentName2 > "") {
			myContent2 = readHtml(contentName2);
		//console.log("My content2 is: " + contentName2);
		}
		if ( contentName3 > "") {
			myContent3 = readHtml(contentName3);
		//console.log("My content3 is: " + contentName3);
		}

		var template = handlebars.compile(mainFile);

		// NOW this call combines our HTML code, based upon what files we read in.
		var result = template({
			LeftieContents : myContent1,
			RightieContents: myContent2,
			myUsername : myUsername,
			CustomizePaneContents: myContent3
		});

		return result;
	};

	return Templater;

})();

exports.template = new Templater()
