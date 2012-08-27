
var util = require('util'),
fs = require('fs'),
g = require('../globals.js'),
mongoose = require('mongoose');
eval(fs.readFileSync('../client/validators.js').toString()); // Creates "Validators

// *****************************************
// The four^H^H^H^Hfive pages in the whole
// application
// *****************************************


exports.ws = function(req, res){

  // The DB is down: return a nice "we are down" page
  if(req.pages.dbDown){
    res.status = 500;
    res.render('error',  { layout:false } );
    return;
  }

  // The workspace doesn't exist: return the "Workspace not found" page
  if(req.pages.noWorkspace){
    res.status = 404;
    res.render('notFound',  { layout:false } );
    return;
  }

  // User is not logged in (?!?): redirect to the login page
  if(! req.session.loggedIn ){
    res.redirect('/login');
    return; 
  }

  // Render the index page -- yay!
  res.render('ws',  { 
    layout: false, 
    login: req.session.login,
    workspaceId: req.pages.workspaceId,
    workspaceName: req.pages.workspaceName,
    token: req.pages.token,
  });
};


exports.login = function(req, res){

  var Workspace = mongoose.model("Workspace");

  // The middleware workspaceNamePages in not guaranteed to have been called,
  // since the login page might get called with or without it. So, just in case,
  // set the req.pages variable
  req.pages = req.pages || {};

  // The DB is down: return a nice "we are down" page
  if(req.pages.dbDown){
    res.status = 500;
    res.render('error',  { layout:false } );
    return;
  }

  // The workspace doesn't exist: return the "Workspace not found" page
  if(req.pages.noWorkspace){
    res.status = 404;
    res.render('notFound',  { layout:false } );
    return;
  }
  
  // User is not logged in: show the login page.
  if(! req.session.loggedIn ){
    res.render('login',  { layout:false } );

  // User IS logged in: do the right redirect
  } else {
      
    // If they are trying to access a specific workspace, and have
    // access to it, then simply redirect there
    if( req.pages.workspaceId ){

      Workspace.findOne( { '_id': req.workspaceId, 'access.login' : req.session.login }, function(err, doc){
        if(err ){
          next(new g.errors.BadError503("Database error fetching workspace") );
        } else {
          if(doc){
            res.redirect('/ws/' + req.workspaceId);
          } else {
            res.redirect('/pick');
          }
        }

      }); // Workspace.findOne()

    // No speicfic worskspace: just go and pick
    } else {
      res.redirect('/pick');
    }
  }


};


exports.pick = function(req, res){

  // User is not logged in: redirect to the login page
  if(! req.session.loggedIn ){
    res.redirect('/login');
    return; 
  }

  // Make up a list of workspaces user has access to, and pass it to the jade template
  var list = [];
  var Workspace = mongoose.model('Workspace');
  Workspace.find( { 'access.login': req.session.login }, function(err, docs){
    if( err ){
      next(new g.errors.BadError503("Database error fetching login") );
    } else {
      docs.forEach( function(workspace){
        list.push( { name: workspace.name, description: workspace.description, id: workspace._id } );
      });

      // If there is only one workspace in the list, there is no point in having to pick: goes straight there
      if( list.length == 1){
        res.redirect('/ws/' + list[0].id);
      } else {
        res.render('pick',  { layout:false, login: req.session.login, list:list, emptyList: list.length == 0 } );
      }
    }
  });
}


exports.recover = function(req, res){
  res.render('recover',  { layout:false, login: req.session.login } );
};

// If you are already logged in, you cannot register a workspace from here
// and you are redirected to the login page (which in turn will show the
// list of workspaces)
exports.register = function(req, res){
  res.render('register',  { layout:false, login: req.session.login } );
};


