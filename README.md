hotplate
========

Hotplate is a framework that allows you to create 201X software in no time.
By 201X software I mean software that:

* allows you to log in using Facebook, Google, Twitter, Oauth1/2, or... well, login/password pair if you like
* available anywhere with a Javascript runtime (see: any modern browser)
* _feels like_ software, and not like a bunch of web pages
* uses a smart client, and a smart server; the smart client is to display information is the most user-friendly possibly way, whereas the smart server is to provide a bunch of secure data-store that are JSON-REST compatible
* handles errors (including, and in fact _especially_, network errors) properly. If anything really bad happens, the application must not stop. Instead, it will tell the user that something network-wise went wrong
* has the ability to communicate to your users in different ways: email, SMS, and whatever the world throws at us
* whos information **as it changes** to the user. If you have three tabs open, and change your user photo, from one tab, the other two tabs need to see the new photo as well

I realise that in 202X (that is, 2020 to 2030) writing software will be different. What is cool now, will be taken 100% for granted. Or maybe Javascript will be dead. I don't know, and I frankly don't care. I wrote Hotplate because I felt that this is what software _should_ be in 201X -- which is now.

## Status:

* Authentication: DONE
* General code cleanup, and hotCoreMessags: UPCOMING
* Write a sample, small application: UPCOMING
* Writing the messenging framework: UPCOMING

# Basic concepts

Hotplate itself is essentially a module loader and a system to invoke (or emit) and listen to messages. In theory, this is easy, and possible, by using existing functions (EventEmitter comes to mind). However, Hotplate goes much further than this: it allows you to define `init()` and `run()` functions, and -- more importantly -- it allows you to define initialisation order depending on which module needs what.

For example if a module calls the hook `someHook`, Hotplate will make sure that _all_ modules which implement `someHook` will be initialised _before_ the one emitting it. When `someHook` is emitted, hotplate will run `someHook` in _all_ modules that implement it (which at that point have been initialised), and will return the results to the caller. 

At a very basic level, Hotplate is a system to define configuration variables, register modules, work out their initialisation order, allow those modules to call other module's hooks and get their results as an array. Every module on top of Hotplate follows these concepts.

Some of the modules are considered "core" -- they all start with `hotCoreXXX`. They provide basic functionality for any "software as a service". Other modules are not part of core: for example the hotDojoXXX modules offer functionalities to use Dojo within Hotplate.

# Getting started with Hotplate

First of all, checkout **[starting_point]**. That's the basic, straight "expressJS" application that comes out of creating an application using the command `express`. The application's source code is pretty basic:

    /**
     * Module dependencies.
     */

    var express = require('express');
    var http = require('http');
    var path = require('path');

    var app = express();

    // all environments
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }

    http.createServer(app).listen(app.get('port'), function(){
      console.log('Express server listening on port ' + app.get('port'));
    });

Basically, all of the template-oriented parts of Express (see: Jade) has been taken out. While you might still want to use Jade (that is, it's not forbidden to do so), keep in mind that Hotplate aims at creating one page, rich applications. So, chances are that you won't actually need to create "pages" as such in your application -- or, at least that's the hope.

So, now start integrating hotplate into your world.

# Your first Hotplate module

The most important bit to add to your app.js file is the code that registers, initialises and runs Hotplate modules. That's easily done:

    var app = express();

    // Associate "app" to hotplate
    hotplate.setApp( app );

    // Register the Hotplate modules
    hotplate.registerModule( 'module1', require('module1') );

    // Initialise the modules. Once done, continue with node's usual rock&roll
    hotplate.initModules( function() {

      // all environments
      app.set('port', process.env.PORT || 3000);

      // ... existing code ...

      // development only
      if ('development' == app.get('env')) {
        app.use(express.errorHandler());
      }

      // Run the modules. This will call `run` of each module. `run` can do all sorts
      // of fancy things, like setting routes etc.
      hotplate.runModules( function() {

        http.createServer(app).listen(app.get('port'), function(){
          console.log('Express server listening on port ' + app.get('port'));
        });
      });
    });


The first line (`setApp`) will store Express' `app` variable into Hotplate. This way, any module requiring Hotplate will also have access to `app` -- which means that they can do things like set routes etc.

The second line registers `module1` as a Hotplate module.

After registration, the third line calls `hotplate.initModules()` which will run `init()` for every registered module. Since `init()` functions are asynchronous, a callback is called once all modules are initialised: that function will actually be the one continuing Express' initialisation (the usual bunch of `app.use()` etc.).

Once all of the Express setting is out of the way, it's time to run `hotplate.runModules()` which will call the `run()` function in all registered modules.

The full code for app.js is this:

    // ** app.js

    /**
     * Module dependencies.
     */

    var express = require('express');
    var http = require('http');
    var path = require('path');
    var hotplate = require('hotplate');
    
    var app = express();
    
    // Associate "app" to hotplate
    hotplate.setApp( app );
    
    // Register two Hotplate modules
    hotplate.registerModule( 'module1', require('module1') );
    
    // Initialise the modules. Once done, continue with node's usual rock&roll
    hotplate.initModules( function() {
    
      // all environments
      app.set('port', process.env.PORT || 3000);
      app.set('views', __dirname + '/views');
      app.set('view engine', 'jade');
      app.use(express.favicon());
      app.use(express.logger('dev'));
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(app.router);
      app.use(express.static(path.join(__dirname, 'public')));
    
      // development only
      if ('development' == app.get('env')) {
        app.use(express.errorHandler());
      }
    
      // Run the modules. This will call `run` of each module. `run` can do all sorts
      // of fancy things, like setting routes etc.
      hotplate.runModules( function() {
    
        http.createServer(app).listen(app.get('port'), function(){
          console.log('Express server listening on port ' + app.get('port'));
        });
      });
    
    }) // End of the rock&roll


The output from the server is interesting; it will look like this:

    $ node app.js 
    Adding module1 to the full list of modules to initialise
    FULL LIST OF MODULES TO INITIALISE IS: module1

       Adding module1
       Module module1's init() doesn't invoke anything and doesn't have any `after` list, it can be added right away
       Called actuallyAdd() on module1
       initStatus on module1 is: NOT_ADDED
       Initialising module module1, since it hadn't been initialised yet
       Module module1 set as 'ADDED'
    ORDERED LIST: module1
    Calling init call for module module1
    The module 'module1' was initialised
    Running hook "run" for module1
    The module 'module1' was run
    Express server listening on port 3000

The lines `The module 'module1' was initialised` and `The module 'module1' was run` actually came from the module's code, which is really simple:

    // ** module1.js

    // Require hotplate
    var hotplate = require('hotplate');

    // The `hooks` array defines this module's hooks
    var hooks = exports.hotHooks = {};

    hooks.init = function( done ){
      console.log("The module 'module1' was initialised");
      done( null );
    };

    hooks.run = function( done ){
      console.log("The module 'module1' was run");
      done( null );
    }

    hooks.something = function( passedValue, done ){
      done( null,  {
        returned: passedValue + 1
      });

    }

# Making things more interesting: multiple modules

The main strength of Hotplate is the ability to register modules and define hooks. For example, you probably noticed that `module1` defines a hook called `something`, but no other module actually makes use of it at all. The hook is not very useful, but it will definitely help understand how Hotplate works.


Define a second module with the following code:
    
    // Require hotplate
    var hotplate = require('hotplate');
    
    // The `hooks` array defines this module's hooks
    var hooks = exports.hotHooks = {};
    
    hooks.init = function( done ){
      console.log("The module 'module2' was initialised");
    
      hotplate.invokeAll( 'something', 10, function( err, results ){
    
        console.log( "The variable results is: " );
        console.log( results );
        done( null );
      });
    };
    hooks.init.invokes = [ 'something' ];
    
    hooks.run = function( done ){
    
      console.log("The module 'module2' was run");
      done( null );
    }

Also, make sure you have this in your app.js file:

    hotplate.registerModule( 'module2', require('module2') );

Make sure you register `module2` *before* registering `module1`.

As you can see, a lot of interesting things are happening here. The second module has a more complex `init()` function, which will run `hotplate.invokeAll()` for the hook `something`. Also, the array `init.invokes` is defined as it's assigned an array containing 'something' (the name of the hook). The `invokes` array is crucial to let Hotplate know that it will need to initialise all modules implementing the hook `something` _beforehand_  This will ensure that by the time `hook.something` is called, every module is effectively fully initialised.

The output of `node app.js` is now very interesting:

    $ node app.js 
    Adding module2 to the full list of modules to initialise
    Adding module1 to the full list of modules to initialise
    FULL LIST OF MODULES TO INITIALISE IS: module2,module1
    
       Adding module2
       Module module2 calls invokeAll(something), checking which modules provide it, adding them first
       ----Looking for modules that provide something...
       Module module1 first then, checking if it has an init() function...
       Module module1 DOES need to init(), considering adding it to the list of modules to load
       ADDED!!! Adding module module1 to the sublist, its status was NOT_ADDED
       LIST of dependencies for module2 is: [module1]. Reiterating self if necessary (intending in)
    
         Adding module1
         Module module1's init() doesn't invoke anything and doesn't have any `after` list, it can be added right away
         Called actuallyAdd() on module1
         initStatus on module1 is: NOT_ADDED
         Initialising module module1, since it hadn't been initialised yet
         Module module1 set as 'ADDED'
       THERE should be no un-init()ialised dependencies for module2 at this stage
       Called actuallyAdd() on module2
       initStatus on module2 is: NOT_ADDED
       Initialising module module2, since it hadn't been initialised yet
       Module module2 set as 'ADDED'
    
       Adding module1
       Module module1's init() doesn't invoke anything and doesn't have any `after` list, it can be added right away
       Called actuallyAdd() on module1
       initStatus on module1 is: ADDED
       Module module1 not initialised, as its status was ADDED, nothing to do!
    ORDERED LIST: module1,module2
    Calling init call for module module1
    The module 'module1' was initialised
    Calling init call for module module2
    The module 'module2' was initialised
    Running hook "something" for module1
    The variable results is: 
    [ { returned: 11 } ]
    Running hook "run" for module2
    The module 'module2' was run
    Running hook "run" for module1
    The module 'module1' was run

The module `module2` was registered _before_ `module1`. However, `module2`'s initialisation was delayed because of `init.invokes`, which had the hook `something`: this prompted Hotplate to load all modules implementing `something()` _first_ (that is, `module1`).

# One more way of setting priorities

Using `init.invokes` is very handy, as you don't have to worry much: you will know that all modules with 





