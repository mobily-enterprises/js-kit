/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    mongoose = require('mongoose'),
    db = require('./db.js'),

    // Pages and routes
    routesData = require('./routes/routesData.js'),
    routesDataAnon = require('./routes/routesDataAnon.js'),
    routesNonData = require('./routes/routesNonData.js'),
    routesPages = require('./routes/routesPages.js'),

    AppErrorHandler = require('./AppErrorHandler.js').AppErrorHandler,
    fs = require('fs'),
    path = require('path');

var app = express();

// Connect to DB
mongoose.connect('mongodb://localhost/bookings2');

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


// Utility function to load attempt to load workspaceName. It will set
// either req.dbDown, req.noWorkspace or req.wsId
app.param('workspaceName', function( req, res, next, workspaceName ){

  var Workspace = mongoose.model('Workspace');

  Workspace.findOne({ name: workspaceName}, function(err, doc){
    if(err){
      req.dbDown = true;
      next();
    } else {
      if(doc){
        req.workspaceId = doc._id;
        req.workspaceName = doc.name;
        next();
      } else {
        req.noWorkspace = true;
        next();
      } 
    }
  });
});


app.param('workspaceId', function( req, res, next, workspaceId ){

  var Workspace = mongoose.model('Workspace');

  Workspace.findOne({ _id: mongoose.Types.ObjectId(workspaceId) }, function(err, doc){
    if(err){
      console.log(err);
      req.dbDown = true;
      next();
    } else {
      if(doc){
        req.workspaceId = doc._id;
        req.workspaceName = doc.name;
        next();
      } else {
        req.noWorkspace = true;
        next();
      } 
    }
  });
});


/* 
 ****************************************************************
 * PAGES
 ****************************************************************
*/
app.get('/ws', function(req, res, next){ res.redirect('/login'); } );
app.get('/ws/:workspaceId', routesPages.ws);
app.get('/recover', routesPages.recover);
app.get('/login', routesPages.login);
app.get('/login/:workspaceName', routesPages.login);
app.get('/register', routesPages.register);
app.get('/pick', routesPages.pick);



/* 
 ****************************************************************
 * NON-DATA CALLS
 ****************************************************************
*/
app.post('/nondata/recoverAnon', routesNonData.postRecoverAnon );
app.post('/nondata/loginAnon', routesNonData.postLoginAnon);
app.post('/nondata/logoutAnon', routesNonData.postLogout);


/* 
 ****************************************************************
 * DATA CALLS -- ANONYMOUS
 ****************************************************************
*/

app.get( '/data/workspacesAnon', routesDataAnon.getWorkspacesAnon );
app.get( '/data/usersAnon'     , routesDataAnon.getUsersAnon );
app.post('/data/workspacesAnon', routesDataAnon.postWorkspacesAnon );


/* 
 ****************************************************************
 * DATA CALLS
 ****************************************************************
*/

app.post( '/data/test', routesData.postTest );
app.post( '/data/workspaces', routesData.postWorkspaces);




// Create the actual server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


