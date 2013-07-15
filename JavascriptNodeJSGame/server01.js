/*  PROG 282 
    Craig Mills, FINAL project 
*/
var express = require('express')
	, routes = require('./routes')
	, user = require('./routes/user')
	, http = require('http')
	, fs = require('fs')
	, mkdirp = require('mkdirp')
	, openid = require('openid')
	, url = require('url')
	, couch = require('./Library/CouchCode')
	, querystring = require('querystring')
	, path = require('path')
	, templater = require('./Library/Templater');

var openIdLogin = null;
	
var app = express();

app.set('port', process.env.PORT || 30025);
app.set('view', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var myBaseHtml_GLB = '/public/TemplateHTML/myTemplate.html';	// PRIME CONFIG.JSON candidate...start with our base template file

var myIPAddress_GLB = "htffftp://127.0.0.1:30025";	// DEFAULT in case nothing set from CONFIG.JSON file
var myCouchDBAddress_GLB = "httasdf://127.0.0.1:5984";		// DOESN'T WORK :: NOT IMPLEMENTED
var dbName = 'couch_mills';

// CONFIG.JSON to configure IP address...
// MUST have lowercase http in its address...
var myIP = fs.readFileSync('config.json', 'utf8');

console.log("Found CONFIG.JSON: content is: '" + myIP + "'");
var storeIt =  JSON.stringify(myIP);
console.log("stringified is: '" + storeIt + "'");

var myEvaled = eval( "(" + storeIt +")" );
console.log("stringified Evaled now: '" + myEvaled + "'");

// So you CAN'T just eval from file itself...
myEvaled = eval("(" + myIP + ")" );
console.log("bad display: non-stringified file content Evaled is: '" + myEvaled);

// BUT has built the object okay...
console.log("myEvaled IP is: '" + myEvaled.myIPAddress + "'");
console.log("myEvaled['myIPAddress'] is: " + myEvaled['myIPAddress']);
console.log(" ");
//var mystringifiedEval = eval( "(" + storeIt+ ")");
//console.log("mystringifiedEval is: '" + mystringifiedEval + "'");

if ( myEvaled.myIPAddress > "") {	// ONLY replace if it's defined correctly
	myIPAddress_GLB = myEvaled.myIPAddress;
}
if ( myEvaled.myCouchDBAddress > "" ) {
	myCouchDBAddress_GLB = myEvaled.myCouchDBAddress;
}
/*
// TEST
var myTestJSON = fs.readFileSync('test.json', 'utf8');
console.log("Found TEST.JSON: content is: '" + myTestJSON + "'");
var testStringify =  JSON.stringify(myTestJSON);
console.log("stringified is: '" + testStringify + "'");

var myTestEval = eval( "(" + testStringify +")" );
console.log("stringified Evaled now: '" + myTestEval + "'");

// So you CAN'T just DISPLAY the eval from file itself...
myTestEval = eval("(" + myTestJSON + ")" );
console.log("CANNOT just DISPLAY eval file return: eval of myTestJSON is: '" + myEvaled);

console.log("BUT it has set the values correctly...");
console.log("found state in myEvaled.state: '" + myTestEval.state + "'");
console.log("found capital in myEvaled.capital: '" + myTestEval.capital + "'");
*/

console.log("myIPAddress_GLB: " + myIPAddress_GLB);
console.log("myCouchDBAddress_GLB: " + myCouchDBAddress_GLB);


var relyingParty = new openid.RelyingParty(
	myIPAddress_GLB + '/go', 	// Verification....
	//'http://localhost:30025/go', // Verification URL (yours)
	
	null, // Realm (optional, specifies realm for OpenID authentication)
	false, // Use stateless verification
	false, // Strict mode
	[]
);

// Get the openid username
var getUsersName = function(identity) {
	var data = identity.replace('http://', '');
	return data.replace('/', '');
}

// Create a directory
//
// NO LONGER REALLY USED FOR ANYTHING
//
var makeDir = function(directory) {'use strict';
	var dest = __dirname + '/users/' + directory;
	mkdirp(dest, function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("Created directory");
		}
	});
	copyFile(__dirname + '/README.md', dest + "/README.md");
};

function copyFile(source, target) {
	var rd = fs.createReadStream(source);
	rd.on("error", function(err) {
		done(err);
	});
	var wr = fs.createWriteStream(target);
	wr.on("error", function(err) {
		done(err);
	});
	wr.on("close", function(ex) {
		done('Success');
	});
	rd.pipe(wr);

	function done(msg) {
		console.log(msg);
	}
}

// now define the routes....
//app.get('/', routes.index);
app.get('/users', user.list);

app.use('/', express.static(__dirname + '/routes'));
app.use('/', express.static(__dirname + '/public'));
app.use('/', express.static(__dirname + '/SavedGames'));
app.use('/', express.static(__dirname + '/TemplateHTML'));		// DON'T need this...

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


app.get('/', function(req, res) {
	// Deliver an OpenID form on all other URLs
	var html = fs.readFileSync('public/login.html');
	res.writeHeader(200, {"Content-Type": "text/html"});
	res.end(html);
});

app.get('/go', function(request, response) {
	openIdLogin = request.query;	// save current login
	relyingParty.verifyAssertion(request, function(error, result) {
	
		var htmlTemplate = templater.template;		// instance the templating library 
		
		if ( !error && (result.authenticated)) {
			var identity = openIdLogin['openid.identity'];
			var usersName = getUsersName(identity);
			makeDir(usersName);
			
			console.log("reading Game's default templated HTML file...");
			// Now, by default display The Game Grid AND the Test Scoring HTML file...
			//var html = fs.readFileSync('public/TemplateHTML/TestGrid.html');	// DON'T hard-code any more; use templates
			response.redirect('/gameItself?userName='+usersName);
			
		} else {
			response.end('Failure on method "go" !!   :(');
		}
	});
});

app.get('/authenticate', function(req, res) {
	console.log("Authenticate called");
	console.log(req.query);
	// User supplied identifier
	var query = querystring.parse(req.query);
	console.log("Parsed Query: " + query);
	var identifier = req.query.openid_identifier;
	console.log("identifier: " + identifier);

	// Resolve identifier, associate, and build authentication URL
	relyingParty.authenticate(identifier, false, function(error, authUrl) {
		if (error) {
			res.writeHead(200);
			res.end('Authentication failed: ' + error.message);
		} else if (!authUrl) {
			res.writeHead(200);
			res.end('Authentication failed');
		} else {
			res.writeHead(302, {
				Location : authUrl
			});
			res.end();	
		}
	});
});

// Save the character's current stats
app.get('/writeCharacter', function(request, response) {
	console.log("Saving character stats...");
	
	var json = request.query;

	console.log('Here are the properties passed in the request: ');
    for (var propertyName in request.query) {
        console.log(" -> " + propertyName);
    }

	// Display both pieces of data separately
    var traitsString = JSON.stringify(json, null, 4);
    //console.log('Path: ' + JSON.stringify(path));
    console.log('Stats: ' + traitsString);
    
//	// Now do our actual work of writing the file.
//    // This assumes the path exists. See the mkdirp 
//    // NPM library if you need to create directories
//    fs.writeFile( __dirname + "/users/" + request.query.Type, traitsString, 'utf8', function(err, data){
//        if (err) throw err;
//        console.log('It\'s been saved!!');
//    });
    
    // Send back a response
    response.send('{"result":"success"}');
	 
});

app.get('/read', function(request, response){
	console.log('Read called.');
	var obj;
	
	function readData(err, data) {
		if (err) throw err;
		obj = JSON.parse(data);
		response.send(obj);
	}
	// Asynch call 
	fs.readFile(fileName, 'utf8', readData);
});

//
// This route displays the Game along with stats updates, Save Character button, etc.
//
app.get('/gameItself', function(request, response) { 'use strict';
	console.log('gameItself was called...');
	
	// set some session id for username passed in ...
	var myUsername = request.query.userName;
	
	var htmlTemplate = templater.template;		// instance the templating library 
	try {
		debugger;
		// Now, use handlebars to display the game, with the stats, but NOT the combat test
		var content1 = __dirname + '/public/TemplateHTML/GridGame.html';
		// We will add in the the combat tester....
		var content2 = "";	// __dirname + '/public/TemplateHTML/TestScoring.html';	// DON'T show scoring
		var content3 = "";		// used for the 'customize' pane...
		var content3 = __dirname + '/public/TemplateHTML/customizePane.html';	// the options for this page
		
		var myStartHTML = __dirname + myBaseHtml_GLB;
		var html = htmlTemplate.addContent( myStartHTML, myUsername, content1, content2, content3);
		
		response.writeHead(200, {"Content-Type": "text/html"});
		response.end(html);
	} catch(error) {
		console.log(error);
		// ADD ERROR CHECKING
	}
});
		
//
// Now using templating, and giving up on using a button click -- resorting to a
// link because that works, while the button does NOT. 
//
app.get('/launchTesting', function(request, response) {
	console.log('launchTesting was called...');

	// Get the passed-in username
	var myUsername = request.query.userName;

	var htmlTemplate = templater.template;		// instance the templating library 
	try {
		debugger;
		
		// Now, use handlebars to display JUST the test mode 
		var content1 = "";		// do NOT populate grid: __dirname + '/public/TemplateHTML/GridGame.html';
		var content2 = "";
		// We will add in teh the combat tester....
		var content2 = __dirname + '/Public/TemplateHTML/TestScoring.html';	// the test Scoring HTML code.
		var content3 = "";		// used for the 'customize' pane...
		var content3 = __dirname + '/Public/TemplateHTML/customizePane.html';	// the options for this page
		
		var myStartHTML = __dirname + myBaseHtml_GLB;
		var html = htmlTemplate.addContent( myStartHTML, myUsername, content1, content2, content3);
		
		//var html = fs.readFileSync('public/TemplateHTML/TestScoring.html');
		
		response.writeHead(200, {"Content-Type": "text/html"});
		response.end(html);
	} catch(error) {
		console.log(error);
	}
});

//
// BOTH grid & testing on the same screen...
app.get('/gameAndTest', function( request, response) { 'use strict';
	console.log('gameAndTest was called...');
	
	// Get the passed-in username
	var myUsername = request.query.userName;

	var htmlTemplate = templater.template;		// instance the templating library 
	try {
		debugger;
		// Now, use handlebars to display the game AND the test mode 
		var content1 = __dirname + '/public/TemplateHTML/GridGame.html';
		// We will add in the the combat tester....
		var content2 = __dirname + '/public/TemplateHTML/TestScoring.html';	// the test Scoring HTML code.
		var content3 = "";		// used for the 'customize' pane...
		var content3 = __dirname + '/public/TemplateHTML/customizePane.html';	// the options for this page
		
		var myStartHTML = __dirname + myBaseHtml_GLB;
		var html = htmlTemplate.addContent( myStartHTML, myUsername,  content1, content2, content3);
		
		response.writeHead(200, {"Content-Type": "text/html"});
		response.end(html);
	} catch(error) {
		console.log(error);
		// ADD ERROR CHECKING
	}
	
});

//
// This route displays the Game Grid Only HTML file...
app.get('/gridOnly', function(request, response) { 'use strict';
	console.log('gridOnly was called...');
	
	// Get the passed-in username
	var myUsername = request.query.userName;

	var htmlTemplate = templater.template;		// instance the templating library 
	try {
		debugger;
		// Now, use handlebars to display JUST THE GRID 
		var content1 = __dirname + '/public/TemplateHTML/TestGrid.html';
		// We will add in the the combat tester....
		var content2 = "";	// __dirname + '/public/TemplateHTML/TestScoring.html';	// DON'T show scoring
		var content3 = "";		// used for the 'customize' pane...
		var content3 = __dirname + '/public/TemplateHTML/customizePane.html';	// the options for this page
		
		var myStartHTML = __dirname + myBaseHtml_GLB;
		var html = htmlTemplate.addContent( myStartHTML, myUsername, content1, content2, content3);
		
		response.writeHead(200, {"Content-Type": "text/html"});
		response.end(html);
	} catch(error) {
		console.log(error);
		// ADD ERROR CHECKING
	}
});
						
//
// When we need to create a directory...
app.get('/createMyDirectory', function(request, response) { 'use strict';
	// User supplied dirName
	var query = querystring.parse(request.query);
	console.log("Having parsed Query: " + query);
	var dirName = req.query.dir_name;
	console.log("dir_name: " + dir_name);

	console.log('createDirectory was called');
	
	response.send({'result':'success'});
});

app.get('/couchReadDoc', function(request, response) {;
	console.log('couchReadDoc: ' + request.query.docName);
	couch.couchCode.readDoc(request.query.docName, dbName, response);
});

app.get('/couchWriteDoc', function(request, response) {
	console.log('couchWriteDoc docName: ' + request.query.docName);
	console.log('couchWriteDoc data: ' + request.query.myData);
	//couch.couchCode.writeDoc(request.query.docName, dbName, response);
	couch.couchCode.sendToCouch(response, request.query.myData, request.query.docName, dbName);
});

app.get("/couchReadAttached", function(request, response) {'use strict';
   console.log('/couchReadAttached called');
   console.log(request.query);
   couch.couchCode.getAttachedDocument(response, request.query.docName, dbName);
});

app.get("/couchReadHtml", function(request, response) {'use strict';
   console.log('/couchReadHtml called');
   console.log(request.query);
   couch.couchCode.getAttachedHtml(response, request.query.docName, dbName);
});

app.get('/couchReadImage', function(request, response) {'use strict';
	console.log('/couchReadImage called');
	couch.couchCode.getAttachedImage(response, request.query.docName, dbName);
});	

