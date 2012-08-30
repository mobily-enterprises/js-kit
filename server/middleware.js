
var express = require('express'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    utils = require('./utils.js');
    g = require('./globals.js');

exports.workspaceNamePages = function( req, res, next, workspaceName ){

  var Workspace = mongoose.model('Workspace');
  req.application = {};

  Workspace.findOne({ name: workspaceName}, function(err, doc){
    if(err){
       res.status = 500;
       res.render('error',  { layout: false } );
    } else {
      if(doc){
        req.application.workspaceId = doc._id;
        req.application.workspaceName = doc.name;
        req.application.token = '';
        req.application.login = req.session.login;
        req.application.workspace = doc; // Contains all of the settings!

        next();
      } else {
        res.status = 404;
        res.render('notFound',  { layout: false } );
      }
    }
  });
};


exports.workspaceIdPages = function( req, res, next, workspaceId ){

  var Workspace = mongoose.model('Workspace');
  req.application = {};

  // FIXME http://stackoverflow.com/questions/12192463/error-handler-when-throwing-in-express
  // Check that the workspaceId is in a valid format
  if(  ! utils.ObjectIdCheck(workspaceId)){
    res.status = 404;
    res.render('notFound',  { layout: false } );
    return;
  }

  Workspace.findOne({ _id: mongoose.Types.ObjectId(workspaceId), 'access.login':req.session.login }, function(err, doc){
    if(err){
       res.status = 500;
       res.render('error',  { layout: false } );
    } else {
      if(doc){
        req.application.workspaceId = doc._id;
        req.application.workspaceName = doc.name;
        req.application.token = doc.access.filter(function(entry){ return entry.login == req.session.login;  } )[0].token;
        req.application.login = req.session.login;
        req.application.workspace = doc; // Contains all of the settings!

        next();
      } else {
        res.redirect('/pages/login') ;
      }
    }
  });
};



exports.workspaceIdCall = function( req, res, next, workspaceId ){
  var Workspace = mongoose.model('Workspace');
  req.application = {};

  // Not authorized to di anything as not logged in
  if(! req.session.loggedIn){
    next( new g.errors.ForbiddenError403() );
    return;
  }
  
  // Check that the workspaceId is in a valid format
  if( ! utils.ObjectIdCheck(workspaceId) ) {
      next( new g.errors.ValidationError422( "Workspace id not valid" ) );
      return;
  }

  // Attempts to set the required variables
  Workspace.findOne({ _id: mongoose.Types.ObjectId(workspaceId), 'access.login':req.session.login }, function(err, doc){
    if(err){
      next( new g.errors.RuntimeError503( err ) );
    } else {
      if(doc){
        req.application.workspaceId = doc._id;
        req.application.workspaceName = doc.name;
        req.application.token = doc.access.filter(function(entry){ return entry.login == req.session.login;  } )[0].token;
        req.application.login = req.session.login;
        req.application.workspace = doc; // Contains all of the settings!

        next();
      } else {
        next( new g.errors.ForbiddenError403() );
      }
    }
  });
};

exports.idCall = function( req, res, next, id ){

  // Check that the workspaceId is in a valid format
  if( ! utils.ObjectIdCheck(id) ) {
      next( new g.errors.ValidationError422( "ID not valid:" + id) );
      return;
  }
  next();
}

exports.tokenCall = function( req, res, next, token ){

  Workspace = mongoose.model('Workspace');
  User = mongoose.model('User');

  req.application = {};

  // Find the token
  Workspace.findOne({ 'access.token': token } , function(err, doc){
    if(err){
      next( new g.errors.RuntimeError503( err ) );
    } else {
      if(! doc ){
        next( new g.errors.BadtokenError403() );
      } else {

        req.application.workspaceId = doc._id;
        req.application.workspaceName = doc.name;
        req.application.token = token;
        req.application.login = doc.access.filter(function(entry){ return entry.token == token;  } )[0].login;
        req.application.workspace = doc; // Contains all of the settings!

        next();
      }
    }
  });

}

