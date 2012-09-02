/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    mongoose = require('mongoose'),

    // Mongodb for sessions
    mongoStore = require('connect-mongodb'),
    mongoSessionDb = new require('mongodb').Db(
     'sessions',
     new require('mongodb').Server('localhost', 27017, {auto_reconnect: true, native_parser: true})
    ),

    db = require('./db.js'),
    middleware = require('./middleware.js'),

    // Pages and routes
    routesPages = require('./routesPages.js'),

    AppErrorHandler = require('./AppErrorHandler.js').AppErrorHandler,
    fs = require('fs'),
    path = require('path'),
    modules = require('./modules');

var app = express();

// Connect to DB
mongoose.connect('mongodb://localhost/hotplate');

// Configuration

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

  //
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
  app.use(AppErrorHandler);
});

app.configure('development', function(){
  // app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  // app.use(express.errorHandler());
});


// Set parameter functions for middlewares
app.param('workspaceNamePages', middleware.workspaceNamePages);   // Used by /pages/login/WORKSPACENAME
app.param('workspaceIdPages',   middleware.workspaceIdPages);     // Used by /pages/ws/WORKSPACEID

app.param('tokenCall',          middleware.tokenCall);            // Used by API calls
app.param('workspaceIdCall',    middleware.workspaceIdCall);      // Used by API calls
app.param('idCall',             middleware.idCall);               // Used by API calls (generic ID)


/* 
 ****************************************************************
 * PAGES
 ****************************************************************
*/
app.get('/pages/ws',                        function(req, res, next){ res.redirect('/pages/login'); } );
app.get('/pages/ws/:workspaceIdPages',      routesPages.ws);
app.get('/pages/login',                     routesPages.login);
app.get('/pages/login/:workspaceNamePages', routesPages.login);
app.get('/pages/register',                  routesPages.register);
app.get('/pages/pick',                      routesPages.pick);


// Load installed modules
modules.loader(app);

// Create the actual server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

