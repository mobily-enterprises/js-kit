/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    mongoose = require('mongoose'),

    // Mongodb for sessions
    mongoStore = require('connect-mongodb'),
    mongodb = require('mongodb'),
    mongoSessionDb = new mongodb.Db(
     'sessions',
     new mongodb.Server('localhost', 27017, { auto_reconnect: true, native_parser: true } )
    ),

    fs = require('fs'),
    path = require('path');

  var   hotplate = require('./hotplate/hotplate.js');

var app = express();

// Connect to DB
mongoose.connect('mongodb://localhost/hotplate');

hotplate.setApp(app); // Associate "app" to hotplate
hotplate.set( 'staticUrlPath', '/lib/dojo' ); // Set the static URL path for all modules

hotplate.registerCoreModules(); // Register core modules
hotplate.registerAllEnabledModules('node_modules'); // Register non-core modules
// require('anotherModule'); hotplate.registerModule('another', 'anotherModule'); 


hotplate.initModules(); // Initialise and run modules

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
    secret: 'woodchucks are nasty animals',
    key: 'sid',
    cookie: { secure: false }, // MAYBE add:  {maxAge: 60000 * 20}
    store: new mongoStore({db: mongoSessionDb})
  }));

  // Static routes
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(app.router);

  app.use( hotplate.getModule('hotClientFiles').serve() );
  app.use( hotplate.getModule('hotError').hotErrorHandler );
});


app.configure('development', function(){
  // app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  // app.use(express.errorHandler());
});


hotplate.runModules(); // Modules at this point will define their own routes etc

// Create the actual server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

