
var util = require('util'),
fs = require('fs'),
g = require('./globals.js'),
mongoose = require('mongoose'),
utils = require('./utils.js');
eval(fs.readFileSync('../client/validators.js').toString()); // Creates "Validators

// ****************************************************
// The four^H^H^H^Hfive^H^H^H^Hfour pages in the whole
// application
// ****************************************************


exports.login = function(req, res){

  var Workspace = mongoose.model("Workspace");

  // User is not logged in: show the login page.
  if(! req.session.loggedIn ){
    res.render('login',  { layout: false } );
    return;
  }

  // If they are trying to access a specific workspace, and have
  // access to it, then simply redirect there
  if( req.application && req.application.workspaceId ){

    Workspace.findOne( { '_id': req.workspaceId, 'access.userId' : req.session.userId }, function(err, doc){
      if( err ){
        utils.Logger({ logLevel: 4, errorName: err.name, message: err.message, req: req });
        res.render('error',  { layout: false } );
      } else {
        if(doc){
          res.redirect('/pages/ws/' + req.workspaceId);
        } else {
          res.redirect('/pages/pick');
        }
      }

    }); // Workspace.findOne()

  // No speicfic worskspace: just go and pick
  } else {
    res.redirect('/pages/pick');
  }

};


exports.pick = function(req, res){

  // User is not logged in: redirect to the login page
  if(! req.session.loggedIn ){
    res.redirect('/pages/login');
    return; 
  }

  // Make up a list of workspaces user has access to, and pass it to the jade template
  var list = [];
  var Workspace = mongoose.model('Workspace');
  Workspace.find( { 'access.userId': req.session.userId }, function(err, docs){
    if( err ){
      utils.Logger({ logLevel: 4, errorName: err.name, message: err.message, req: req });
      res.render('error',  { layout: false } );
    } else {
      docs.forEach( function(workspace){
        list.push( { name: workspace.name, description: workspace.description, id: workspace._id } );
      });

      // If there is only one workspace in the list, there is no point in having to pick: goes straight there
      if( list.length == 1){
        res.redirect('/pages/ws/' + list[0].id);
      } else {
        res.render('pick',  { layout:false, login: req.session.login, list:list, emptyList: list.length == 0 } );
      }
    }
  });
}

// The register page. The javasript will check if the user is logged in
// -- if they are, they will be able to register without enterting all
// details (or they can chose to logout)
exports.register = function(req, res){
  res.render('register',  { layout:false, login: req.session.login } );
};

