
var express = require('express'),
    mongoose = require('mongoose'),
    g = require('./globals.js'),
    ObjectId = mongoose.Types.ObjectId;


exports.workspaceNamePages = function( req, res, next, workspaceName ){

  var Workspace = mongoose.model('Workspace');
  req.pages = {};

  if(! req.session.loggedIn){
    next();
    return;
  }

  Workspace.findOne({ name: workspaceName}, function(err, doc){
    if(err){
      req.pages.dbDown = true;
      next();
    } else {
      if(doc){
        req.pages.workspaceId = doc._id;
        req.pages.workspaceName = doc.name;
        next();
      } else {
        req.pages.noWorkspace = true;
        next();
      }
    }
  });
};


exports.workspaceIdPages = function( req, res, next, workspaceId ){

  var Workspace = mongoose.model('Workspace');
  req.pages = {};

  if(! req.session.loggedIn){
    next();
    return;
  }

  Workspace.findOne({ _id: mongoose.Types.ObjectId(workspaceId), 'access.login':req.session.login }, function(err, doc){
    if(err){
      req.pages.dbDown = true;
      next();
    } else {
      if(doc){
        req.pages.workspaceId = doc._id;
        req.pages.workspaceName = doc.name;
        req.pages.token = doc.access.filter(function(entry){ return entry.login == req.session.login;  } )[0].token;
        next();
      } else {
        req.pages.noWorkspace = true;
        next();
      }
    }
  });
};

exports.tokenApi = function( req, res, next, token ){

  Workspace = mongoose.model('Workspace');
  User = mongoose.model('User');

  req.application = {};

  // Find the token
  Workspace.findOne({ 'access.token': token } , function(err, doc){
    if(err){
      next( new g.errors.BadError503('Database error resolving workspace Id') );
    } else {
      if(! doc ){
        next( new g.errors.ForbiddenError403('Access denied') );
      } else {

        // The token is there and it's valid.
        // Set req.application.workspaceId, req.application.login and
        //  req.application.workspace (which contains all of the settings!)
        req.application.workspaceId = doc._id;
        req.application.workspace = doc;
        req.application.login = doc.access.filter(function(entry){ return entry.token == token;  } )[0].login;
        next();
      }
    }
  });

}









   /*
        // SCRAP. Don't need it, as THROUGHOUT the application I will use 'login' (to set permissions etc.). This is because
        // "login" can come from *anywhere* (an external source, etc.)
        User.findOne({ login: login }, function(err, doc){
          if(err){
            next( new g.errors.BadError503('Database error resolving user') );
          } else {
            if(!doc){
              next( new g.errors.BadError503('Database error in user lookup') );
            } else {
              req.application.login = doc._id;

              console.log("DID IT! Workspace: " + req.application.workspaceId + " and user: " + req.application.userId);
            }
          }
        });*/


