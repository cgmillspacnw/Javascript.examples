/*
Craig Mills (from a pattern by Charlie Calvert)
June 4, 2013

This is the starting point: when our HTML file loads, this JS file is
loaded and puts one, and only one, object into the Javascript global 
namespace: CGMApp.  Then, on document ready, we create and begin using
that object.  

Everything else: variables, functions, logic, is all within that object
as a way to minimize exposure to the global namespace.  It's kind of an
odd thing to get used to, but after two quarters I wanted to use it.

*/


// The only item our program puts in the global namespace.
//
// The naming convention is to TRY to reduce the chances of collisions with
// other items in the global namespace.
//
var CGMApp = {};

// This object will hold all the available library objects 
CGMApp.own = {};

