/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    mongoose = require('mongoose'),
    db = require('./db.js'),
    routes = require('./routes/routes.js'),
    AppErrorHandler = require('./AppErrorHandler.js').AppErrorHandler,
    fs = require('fs'),
    path = require('path');

var app = express();

// Connect to DB
mongoose.connect('mongodb://localhost/bookings');

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
  app.use(express.session({  secret: 'woodchucks are nasty animals', key: 'sid', cookie: { secure: false }   }));

  //
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(AppErrorHandler);
});

app.configure('development', function(){
  // app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  // app.use(express.errorHandler());
});

// Page routes
app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/recover', routes.recover);
app.get('/register', routes.register);

app.get('/Employee/:id', routes.employees);

/* 
 ****************************************************************
 * DATA CALLS
 ****************************************************************
*/

// DATA CALLS: WorkspacesAnon
app.get( '/data/workspacesAnon', routes.getWorkspacesAnon );
app.post('/data/workspacesAnon', routes.postWorkspacesAnon );



/* 
 ****************************************************************
 * NON-DATA CALLS (still using JsonRest for consistency)
 ****************************************************************
*/

// RecoverAnon, loginAnon and logoutAnon
app.post('/data/recoverAnon', routes.postRecoverAnon );
app.post('/data/loginAnon', routes.postLoginAnon);
app.post('/data/logout', routes.postLogout);



/* 
 ****************************************************************
 * DATA STORE CALLS
 ****************************************************************
*/

// WorkspaceUser
app.post('/data/workspacesUser', routes.postWorkspacesUser );



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


