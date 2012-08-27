
var express = require('express'),
    mongoose = require('mongoose');


exports.workspaceNamePages = function( req, res, next, workspaceName ){

  var Workspace = mongoose.model('Workspace');
  req.pages = {};

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

  Workspace.findOne({ _id: mongoose.Types.ObjectId(workspaceId) }, function(err, doc){
    if(err){
      console.log(err);
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

exports.workspaceIdCall = function( req, res, next, workspaceId ){

  Workspace = mongoose.model('Workspace');

  Workspace.findOne( {_id : mongoose.Types.ObjectId(worspaceId) }, function(err, doc){
  });
  next();
}
