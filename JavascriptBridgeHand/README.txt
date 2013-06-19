DMA 265  Javascript
Final Project
Craig Mills
June, 2013

So this website is fairly rudimentary, display-wise.  So I have chosen to concentrate 
upon the meat of Javascript & jQuery itself.  In retrospect... maybe something like that 
Twitter bootstrap thing would have made my life easier... I could have looked into that.

The heft of this program was the logic for playing the hand.  There was a LOT of testing, 
but I can successfully run through any of the ten hands provided with the website, without
any crashes/weirdnesses/errors.  I am storing bridge hands (which will eventually be brought
in from a db... perhaps couchDB or Mongo, one of those JSON-type ones most likely.  

I am not delusional enough to believe that I will be the next to create an award-winning
bridge-playing artificial intelligence, but I really do want to eventually have something 
that I could share with my bridge students, either as a "homework" format, or for a place
to provide feedback/tips/hints about how to play specific types of hands.

Craig Mills

=======================================================================================
It occurs to me that, if you're not real familiar with bridge, then this website may be
hard to see how to use.  Basically, bridge is a trick-taking game, and is played by two 
partners who sit opposite each other at the table against two opponents.  After the 
auction completes, one player is the "declarer" who will be trying to play the hand, to 
win as many tricks as they had bid in the auction.  

The declarer's left-hand oppoenent makes the "opening lead", and then the "dummy's" 
cards (the declarer's partner is the dummy for this hand) are placed face-up on the 
table so that all three players can see them.  

Whoever wins the trick (in the current iteration, no trump suits are allowed, so the 
highest ranking card IN THE SUIT LED TO THE TRICK wins the trick.  

SO to use the website:

Click the Start button at the top, to load up a hand.  (You can pick among ten hands by
using the drop-down list on the right-hand side of the screen under the buttons.)  The
left-hand opponent makes their lead, and you can see dummy's cards and your cards (at 
the bottom of the screen.)  Drag and drop dummy's card that you want to play into the 
area marked as such.  Then your right-hand opponent will play a card, and you drag the
card you want to play from your hand.  

Whichever player's card is the highest will win that trick, the trick counter will be 
adjusted accordingly on the right, and an alert is thrown displaying who won the trick.
(I know you don't like 'em, but it's a way to leave the cards displayed until the 
player is ready to move on to the next trick.  The message can be disabled by clicking
the "Disable Trick Message" button, but when a defender wins the trick they will win and
then lead so fast that it can be confusing.  I do have a "Show Defenders'" cards button
so that some debug text will be displayed with the defenders' cards, for testing and 
for debug purposes.)  

=======================================================================================
