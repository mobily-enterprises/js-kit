Welcome to Hotplate
===================

Hotplate is a framework that allows you to create 201X software in no time.
By 201X software I mean software that has the following features:


* Advanced authentication. Login using any authentication method (Facebook, Google, Twitter, Oauth1/2, login/pass pair) and where no method is "favoured" (see: login and password are only a possible method to get in);
* Live information. Have live information and forms. This means that if you have three tabs open, and change your user photo in one tab, the other two tabs will get updated with the new photo as well. Other users logged in and display your user will get the update right away. Forms need to be live as well: if you are viewing a form, and another user changes the information, your form needs to get reloaded or warn you
* Resiliance. Network and error resiliance; ff anything really bad happens, the application must not stop. Instead, it will tell the user that something network-wise went wrong
* One page. One page application, with ony minimal information transferred from the client to the server
* Use of JSON REST stores for all data access; the client displays information is the most user-friendly possibly way and handles forms, while the server  provides a bunch of secure data stores that are JSON-REST compatible 
* Communication with users via email, SMS,  and whatever the world throws at us
* Modularity. A piece of software should be written as a bunch of independent modules, each one of them requiring specific CSS (included in the page), specific JSes, specific Javascript frameworks, etc.
* Security. Implementing new stores needs to be safe and secure _by default_. It needs to be easy to write permission-granting routines for specific stores
* Established patterns. There needs to be a common way to carry out a common task.
* API-ready. Having an API needs to be as simple as flicking a switch. Rewriting the software logic for the API is the wrong route.
* Multi-homing. Software needs to be multi-home ready, in a world where SaaS is king and people want to have their own little islands.
* Logging. Everything, good or bad, needs to be logged
* Simple, pattern-based forms.

I realise that in 202X (that is, 2020 to 2030) writing software will be different. What is cool now, will be taken 100% for granted in 2025. Or maybe Javascript will be dead. I don't know, and I frankly don't care. I wrote Hotplate because I felt that this is what software _should_ be in 201X -- which is now.

# Getting into it

Hotplate is written for Node. It's a normal, no-frills Node-based framework. So, before you get into Node, you should know:

## Core technologies

* Javascript. Too many resources to list. The book that got me started was [Object-Oriented Javascript](http://www.amazon.com/dp/1847194141). I think it's great that it covers how constructors and objects work.

* [NodeJs](http://nodejs.org/api/all.html)'s documentation. Not exactly tutorial style, but I find that actually going through Node's own documentation is a great way to actually get to know Node. It starts with a simple, basic web server and then goes through all the nitty-gritty about Node. I personally read it once a month, just to freshen up (you end up using a tiny fraction of what's in the docs)

* [ExpressJs](http://expressjs.com/)'s [guide](http://expressjs.com/guide.html) and [API](http://expressjs.com/api.html). Express is actually surprisingly simple and small. It doesn't actually do *that* much, what everything it does is really important, and it does it well. It's important to understand how middleware plugins work.

## Support libraries

* [HTTPErrors](https://github.com/mercmobily/HTTPErrors). A very simple module that creates constructor functions for every HTTP return code (actually, not just errors).

* [SimpleDeclare](https://github.com/mercmobily/simpleDeclare). Javascript is a great language, but it lacks a simple way to declare object constructors and inheriting. A lot of node programmers actually do it by hand, writing `Class.prototype.someMethod = function(){ ... }`. I personally find that absolutely insane. SimpleDeclare solves this problem: it handles (multiple) inheritance, constructor methods, calling of inherited methods, and inheritance of constructor-wide methods. [SimpleDeclare is really small](https://github.com/mercmobily/simpleDeclare/blob/master/declare.js), but it does everything for you.

* [JsonRestStores](https://github.com/mercmobily/JsonRestStores) (which uses [SimpleSchema](https://github.com/mercmobily/SimpleSchema)). Hotplate is all about stores -- really. JsonRestStores is a fundamental piece here: it allows you to create Json REST stores in no time, dealing with permissions, queries, error management, inherited stores, and so on. You should make yourself comfortable with JsonRestStores _while_ studying Hotplate.


## Hotplate's documentation

Hotplate comes with comprehensive documentation **[Note: not yet, documentation is in the works. The statement below are blatantly false]**. It has:

* [A comprehensive guide](http://www.hotplatejs.com/guide.html). The guide takes you from absolute zero, to actually knowing what you are doing with Hotplate. It's a tutorial-style guide, where you are explained everything step by step.

* [Server API documentation](http://www.hotplatejs.com/serverAPI/index.html). It documents what each Hotplate module provides, from a server point of view.

* [Client API documentation](http://www.hotplatejs.com/clientAPI/index.html). It documents what each Hotplate module provides to the clients (for example Dojo widgets).

# TODO

## "CONTACTS AND USERS (LINKED)"
  
- [ ] Make sure linkedUserId is properly protected and it all works (no longer gets overwritten)  
- [ ]   Make any contact form update itself based on linkedUserId being there (contact category will disappear)
- [ ]   Understand how the hell  mainAddressId (and other mainS) did NOT get overwritten without "protected"


- [ ] Improve way in which "Tell us about us" handles an email address being there, no error message
- [ ] Have a select box for email address in user config, taken from contacts' email addresses
- [ ] When adding an email address, if it's the first one, set it as default in userConfig


- [ ] In contact list, mark contacts connected to users
- [ ] In contact list, take the buttons out for linked contacts
- [ ] In contact list, make sure contacts are not DnD-able (meaningless)
- [ ] Add permissions so that a user cannot chance a linked contact unless it's their own (or it's God)    

- [ ] Write functionality so that "delete" actually sets a flag (probably in simpleDbLayer)
- [ ] Check for "default filters" active for a specific store, write pattern for it
- [ ] Check what happens when you delete the selected email address in a contact, must stay selected 

"CONTACTS AND USERS -- EXTRA FEATURES"

- [ ] In contact list, on hover on a contact, come up with contact's view (no editing)

- [ ] Add configuration option to decide sorting of contacts, 
- [ ] Make "sorting of contact" setting the default in contact list at startup


- [ ] In workspace config, add option to have a default country code for SMSes and contact data entry
- [ ] Put the "name" back at the top of the app, taken from the contact, and check that it changes when changed


- [ ] In contact list, add a second view on contacts with all "starred" ones. Use body preprocessing.
- [ ] Check what happens when sorting by boolean, probably need an "onlineBoolean" cast)

-----------------------
DEADLINE: 30 MAY 2014
-----------------------

"CONTACTS -- SEARCH AND WIDGETS"


- [ ] Make up filters for contacts, allow to search for them

- [ ] Write "contact lookup" field form that auto-completes contacts (make it configurable)
- [ ] Use the same widget for selecting groups/categories for a user, or maybe create a "tick" widget

- [ ] Write function to workout _children for a whole store in simpleDbLayer

  -----------------------
  DEADLINE: 10 June 2014
  -----------------------


  "MESSAGES"

  *****
    Add ability to type messages underneath contacts, send a message to multiple recipients (1:n)
    - Use https://bitbucket.org/mutopia/autobox, but maybe use others
    User picks if it's an SMS or if it's an email.  The sending/editing widget will have to change accordingly (SMSes are given less space, no subject)

  "SEND SMS/EMAIL, GATEWAY"

  * Write messages infrastructure, where app can send messages (email, sms) and then a queue manager sends them recording the
  status. Write modules to send (smtp/sms gateway) _and_ receive (pop/sms gateway) messages.
  * Integrate message-sending with the current simple comment infrastructure (!). 
  * Develop the "inbox" for incoming emails/SMSes, mark as read, archived, etc. When an email or SMS comes in, ability to match it to a booking

  "USERS AND INVITES"

  * Write an "invite user" mechanism where users can be invited into the system: they receive an email, will redirect to a screen
    which allows them to register a new user (if available, etc.) or link the workspace to their existing user.
    TO DO THIS, I can definitely get away with just 1) Adding a page that adds a session variable 1a) Redirect to the
    normal welcome page 2) Adding a hook to register and login, so that if that session variable is set, the created user will be
    added to that workspace (UsersWorkspaces store)

  -----------------------
  DEADLINE: 30 June 2014
  -----------------------

  "WORKSPACE MANAGEMENT"

  * Add a "user management" section in settings for workspace Admins only
  * Write a "message browser" for the workspace admin so that they can see exactly what was sent, when, and see the logs
  * Write a "log browser" for workspace owners and for God to see what happened, with filters
  * Decide on permissions/permissions model, maybe follow Drupal's


  "BOOKINGS"

  * Make a "booking": an abstract entity that can be owned by a contact and that has a name and a bunch of people attached.
  ** Ability to have messages under a specific booking, rather than just under a user
  ** Implement simple TODO list for the bookings, date/time from, date/time to, who
 
  ** Add calendar (Dojox's), rendering users' birthdays and TODO items in it

  ----------------------
  DEADLINE: 30 Jul  2014
  ----------------------

  "FINISH UP"

  * Make up God permissions mixin, setting God, add them
  * Make God application separate, with separate login (only God can login)

  * Have a look at hotDojoWidgets/lib/hotDojoWidgets.js, image in head will appear, might be good for the app
  * Create admin interface for things

  ----------------------
  DEADLINE: 20 Aug  2014
  ----------------------

  "CONTACTS -- INTEGRATION"

  * Add G+ authentication
  **** Allow to sync contacts with Facebook
  **** Allow to sync contacts with G+
  * Add buttons to re-sync all contacts from specified modules

  ---------------------
  DEADLINE: 30 Aug 2014
  ---------------------

  "ADVANCED BOOKINGS"

  * Ability to set available "activities" for a contact and all contacts, with cost
  * product, money lines: [ booking owner | line owner | office ] OWES (min, max price) [ booking owner | line owner | office ] / qty
    where qty can be unit, one-off, hourly, block, daily, with min units and unitsMultipleOf
  * Ability to match activities (with dates) for a contact in a booking, render them in the calendar

  "ADVANCED MESSAGES AND TEMPLATES"

  * Ability to set "presence types" (dancer, security, paying guest) -- presentational only
  * Ability to send messages to different present types (all types in a booking)
  * Ability to set templates for messages of different types, with instant previews

  "ACCOUNTING"

  * Accounting summaries for each booking (with system-calculated ones)
  * Interface with payment system (Paypal?)
  * Ability to send invoices
  * Ability to _store_ received invoices



 LATER (hopefully other contributors)
  ------------------------------------
  * Use SOCKJS for messaging,
   no more polling (authentication and reconnection are tricky)
  * Make sure that EditingWidget and StoreSelect are blind-friendly
    Allow country selection for phone number from a select box (straight, Dojo's?)
  * Add animations

