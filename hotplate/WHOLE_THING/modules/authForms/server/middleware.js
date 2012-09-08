
var express = require('express'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    utils = require('./utils.js'),
    g = require('./globals.js'),
    e = require('./errors.js');

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
        req.application.userId = req.session.userId;
        req.application.login = req.session.login;
        req.application.token = '';
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

  Workspace.findOne({ _id: mongoose.Types.ObjectId(workspaceId), 'access.userId':req.session.userId }, function(err, doc){
    if(err){
       res.status = 500;
       res.render('error',  { layout: false } );
    } else {
      if(doc){
        req.application.workspaceId = doc._id;
        req.application.workspaceName = doc.name;
        req.application.userId = req.session.userId;
        req.application.login = req.session.login;
        req.application.token = doc.access.filter(function(entry){ return entry.userId == req.session.userId;  } )[0].token;
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

  // Not authorized to do anything as not logged in
  if(! req.session.loggedIn){
    next( new e.ForbiddenError403() );
    return;
  }
  
  // Check that the workspaceId is in a valid format
  if( ! utils.ObjectIdCheck(workspaceId) ) {
      next( new e.ValidationError422( "Workspace id not valid" ) );
      return;
  }

  // Attempts to set the required variables
  Workspace.findOne({ _id: mongoose.Types.ObjectId(workspaceId), 'access.userId':req.session.userId }, function(err, doc){
    if(err){
      next( new e.RuntimeError503( err ) );
    } else {
      if(doc){
        req.application.workspaceId = doc._id;
        req.application.workspaceName = doc.name;
        req.application.userId = req.session.userId;
        req.application.login = req.session.login;
        req.application.token = doc.access.filter(function(entry){ return entry.userId == req.session.userId;  } )[0].token;
        req.application.workspace = doc; // Contains all of the settings!

        next();
      } else {
        next( new e.ForbiddenError403() );
      }
    }
  });
};

exports.idCall = function( req, res, next, id ){

  // Check that the workspaceId is in a valid format
  if( ! utils.ObjectIdCheck(id) ) {
      next( new e.ValidationError422( "ID not valid:" + id) );
      return;
  }
  next();
}

exports.tokenCall = function( req, res, next, token ){

  var Workspace = mongoose.model('Workspace'),
      User = mongoose.model('User'),
      accessEntry;

  req.application = {};

  // Find the token
  Workspace.findOne({ 'access.token': token } , function(err, doc){
    if(err){
      next( new e.RuntimeError503( err ) );
    } else {
      if(! doc ){
        next( new e.BadtokenError403() );
      } else {
        accessEntry = doc.access.filter(function(entry){ return entry.token == token;  } )[0];

        req.application.workspaceId = doc._id;
        req.application.workspaceName = doc.name;
        req.application.userId = accessEntry.userId;
        req.application.login =  accessEntry.login;
        req.application.token = token;
        req.application.workspace = doc; // Contains all of the settings!

        next();
      }
    }
  });

}

