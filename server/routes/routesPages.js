
var util = require('util'),
fs = require('fs'),
g = require('../globals.js'),
mongoose = require('mongoose');
eval(fs.readFileSync('../client/validators.js').toString()); // Creates "Validators

// ******************************
// The four pages in the whole
// application
// ******************************


exports.ws = function(req, res){

  // The DB is down: return a nice "we are down" page
  if(req.dbDown){
    console.log("HERE");
    res.status = 500;
    res.render('error',  { layout:false } );
    return;
  }

  // The workspace doesn't exist: return the "Workspace not found" page
  if(req.noWorkspace){
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
  res.render('ws',  { layout:false, login: req.session.login, workspaceId:req.workspaceId, workspaceName:req.workspaceName } );

};



exports.pick = function(req, res){

  // User is not logged in: redirect to the login page
  if(! req.session.loggedIn ){
    res.redirect('/login');
    return; 
  }

  // TODO: make up a list of workspaces user has access to, and pass it to the jade template
  var list = [];

  // Render the pick template
  res.render('pick',  { layout:false, login: req.session.login, list:list } );
}


exports.login = function(req, res){

  var Workspace = mongoose.model("Workspace");

  // The DB is down: return a nice "we are down" page
  if(req.dbDown){
    res.status = 500;
    res.render('error',  { layout:false } );
    return;
  }

  // The workspace doesn't exist: return the "Workspace not found" page
  if(req.noWorkspace){
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
    if( req.workspaceId ){

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

    // There was no specific requirement: just go back to pick
    } else {
      res.redirect('/pick');
    }
  }


};

exports.recover = function(req, res){
  res.render('recover',  { layout:false, login: req.session.login } );
};

// If you are already logged in, you cannot register a workspace from here
// and you are redirected to the login page (which in turn will show the
// list of workspaces)
exports.register = function(req, res){
  res.render('register',  { layout:false, login: req.session.login } );
};


