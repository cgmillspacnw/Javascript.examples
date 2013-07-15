Craig Mills:  PROG 282 FINAL attempt
=======================================================

For my game, I did get it into the Express App framework.  It pulls the 
hero.json and orc.json from the database, and saves back the hero.json when you
click the 'save' button.  It does not store/get anything else from couchDB at 
this point, although my InsertData does put my GIFs into the couchDB.  I did not
get to the point of loading/saving grids in the db.  I really wanted the different
NPCs to move differently (rook, bishop etc) and use inheritance to specify a move
for different types, but ran outta time.  

I have a CONFIG.JSON file where you can key in the IP address to use.  I wanted to get 
a second line for having, say, the couchDB on a DIFFERENT machine, but couldn't 
figure out how to send that value to the CouchCode library.  (I remember you had
a part about Sharing Code Between Modules and I will take a look at that.)  

The meat of the program is in the Draw.js file.  (I couldn't figure out how to get 
the keystrokes OUT of that module, and still retain the global variables. Again, I 
remember we talked about it in class but just ran outta time.)  

I did NOT get it linked to any jade/stylus programs.  
I did NOT get any UnitTests into it.  (siiiigh)
I did NOT get any session/cookie management in.

I have several NPCs, and they will roam the board.  If you try to move the hero
into them, they will tell you to watch where you're goin'.  (They won't move into
you, though.)

 
For what it is worth, here is a link to a bridge hand-playing program I wrote for my 
other Javascript class (probably about 48 hrs of work, which should/could have been 
spent on this class) where I applied the Module pattern and wrote a LOT of "internal" 
Javascript code.  
	http://www.lisaandcraig2013.net/BridgeHand

