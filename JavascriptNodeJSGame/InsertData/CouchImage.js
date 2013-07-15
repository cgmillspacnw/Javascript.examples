var couch = require('../Library/CouchCode')
var fs = require('fs');

var dbName = 'couch_mills';

function run() {
	var docName = process.argv[2];
	var fileName = process.argv[3];

	fs.exists(fileName, function(exists) {
		if (exists) {
			var data = fs.readFileSync(fileName);
			
			couch.couchCode.createDatabase(dbName, function(error) {
				if (!error) {
					couch.couchCode.couchAttachImage(null, 'my_images', docName, data, dbName);
				} else {
				  couch.couchCode.reportError(error);			    
				}
			});
		} else {
			console.log('could not find: ' + fileName);
		}
	})
		
	
	
};

function explain() {
	console.log("\n\nPlease pass in the image's docName you want to use in");
	console.log('couchDB and the name of the document you want');
	console.log('send to couchDb\n');
	console.log('Example: ');
	console.log('  node CouchImage.js photo photo.png');
};

if (process.argv.length === 4) {
	run();
} else {
	explain();
}