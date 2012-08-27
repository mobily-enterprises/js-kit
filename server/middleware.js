
var express = require('express'),
    mongoose = require('mongoose');


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
        req.pages.token = doc.access.filter(function(user){ return user.login == req.session.login;  } )[0].token;
        next();
      } else {
        req.pages.noWorkspace = true;
        next();
      }
    }
  });
};

exports.workspaceIdCall = function( req, res, next, workspaceId ){

  Workspace = mongoose.model('Workspace');

  Workspace.findOne( {_id : mongoose.Types.ObjectId(worspaceId) }, function(err, doc){
  });
  next();
}
