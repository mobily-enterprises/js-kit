
var express = require('express'),
    mongoose = require('mongoose'),
    g = require('./globals.js'),
    ObjectId = mongoose.Types.ObjectId;

exports.workspaceNamePages = function( req, res, next, workspaceName ){

  var Workspace = mongoose.model('Workspace');
  req.application = {};

  Workspace.findOne({ name: workspaceName}, function(err, doc){
    if(err){
      req.application.dbDown = true;
      next();
    } else {
      if(doc){

        req.application.workspaceId = doc._id;
        req.application.workspaceName = doc.name;
        req.application.token = '';
        req.application.login = '';
        req.application.workspace = doc; // Contains all of the settings!

        next();
      } else {
        req.application.noWorkspace = true;
        next();
      }
    }
  });
};


exports.workspaceIdPages = function( req, res, next, workspaceId ){

  var Workspace = mongoose.model('Workspace');
  req.application = {};

  if(! req.session.loggedIn){
    next();
    return;
  }

  Workspace.findOne({ _id: mongoose.Types.ObjectId(workspaceId), 'access.login':req.session.login }, function(err, doc){
    if(err){
      req.application.dbDown = true;
      next();
    } else {
      if(doc){

        req.application.workspaceId = doc._id;
        req.application.workspaceName = doc.name;
        req.application.token = doc.access.filter(function(entry){ return entry.login == req.session.login;  } )[0].token;
        req.application.login = req.session.login;
        req.application.workspace = doc; // Contains all of the settings!

        next();
      } else {
        req.application.noWorkspace = true;
        next();
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

