/**
 * Module dependencies.
 */
var express = require('express'),
//    socketIo = require('socket.io'),
    http = require('http'),

    // Mongodb for sessions
    MongoStore = require('connect-mongo')(express),
    mongodb = require('mongodb'),

    fs = require('fs'),
    path = require('path'),
    mw = require('mongowrapper');

var hotplate = require('./hotplate/hotplate.js');

var app = express();

hotplate.setApp(app); // Associate "app" to hotplate

mw.connect('mongodb://localhost/hotplate', {}, function( err, db ){

  // The connection is 100% necessary
  if( err ){
    console.log("Could not connect to the mongodb database. Aborting...");
    console.log( err );
    exit( 1 );
  }

  hotplate.set( 'logToScreen' , true );
  hotplate.set( 'staticUrlPath', '/lib/dojo' ); // Set the static URL path for all modules
  hotplate.set( 'afterLoginPage', '/ws/' );     // Page to go after logging in. Remember / at the end!
  hotplate.set( 'db', mw.db );                  // The DB variable

  hotplate.set( 'dbCheckObjectId', mw.checkObjectId );
  hotplate.set( 'dbObjectId', mw.ObjectId );


  hotplate.registerCoreModules(); // Register core modules
  hotplate.registerAllEnabledModules('node_modules'); // Register non-core modules
  hotplate.registerAllEnabledModules('node_modules/dojo/node_modules'); // Register non-core modules requiring dojo
  hotplate.registerAllEnabledModules('node_modules/mongo/node_modules'); // Register non-core modules requiring mongoDb

  // require('anotherModule'); hotplate.registerModule('another', 'anotherModule'); 


  hotplate.initModules( function() {

    app.configure(function(){

      app.set('port', process.env.PORT || 3000);
      app.set('views', __dirname + '/views');
      app.set('view engine', 'jade');

      // Various middleware
      app.use(express.favicon());
      app.use(express.logger('dev'));
      app.use(express.bodyParser());
      app.use(express.methodOverride());

      // Sessions
      app.use(express.cookieParser('woodchucks are nasty animals'));

      app.use(express.session({
        // secret: settings.cookie_secret,
        secret: 'woodchucks are nasty animals',
        store: new MongoStore({
          // db: settings.db
          // db: hotplate.get('db').client
           db: db
        })
      }));

      // Static routes
      app.use(express.static(path.join(__dirname, 'public')));

      app.use(app.router);

      app.use( hotplate.getModule('hotClientFiles').serve() );
      app.use( hotplate.getModule('hotError').hotErrorHandler );

      // Change this to a cute cute page, and log it with high importance (including stack trace)
      app.use( function( err, req, res, next){ res.send("Oh dear, this should never happen!"); next(err); } );
    });


    app.configure('development', function(){
      // app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    app.configure('production', function(){
      // app.use(express.errorHandler());
    });


    hotplate.runModules( function() { 

      // Create the actual server
      var server = http.createServer(app);

      server.listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
      });
    }); // runModules

  }); // initModules

});
