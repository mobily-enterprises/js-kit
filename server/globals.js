var util = require('util');
var fs = require('fs');
var mongoose = require('mongoose');

exports.errors = {};

// Defining the BadError error type, thrown by the application itself
//
function BadError503( message ){
  this.httpError = 503;
  this.message = message || "Internal error";
  this.name = this.constructor.name;
}
util.inherits(BadError503, Error);
exports.errors.BadError503 = BadError503;

// Defining the NotFoundError error type, thrown by the application itself
//
function NotFoundError404( message ){
  this.httpError = 404;
  this.message = message || 'Action not found';
  this.name = this.constructor.name;
}
util.inherits(NotFoundError404, Error);
exports.errors.NotFoundError404 = NotFoundError404;

// Defining the ValidationError error type, thrown by the application itself
//
function ValidationError422( message , errors ){
  this.httpError = 422;
  this.message = message  || "Parameters validation error";
  this.errors = errors;
  this.name = this.constructor.name;
}
util.inherits(ValidationError422, Error);
exports.errors.ValidationError422 = ValidationError422;

// Defining the Error error type, thrown by the application itself
//
function ForbiddenError403( message ){
  this.httpError = 403;
  this.message = message || "User not logged in";
  this.name = this.constructor.name;
}
util.inherits(ForbiddenError403, Error);
exports.errors.ForbiddenError403 = ForbiddenError403;


// Defining the ParamError error type, thrown by the application itself
//
/* 
function ParamError516( message ){
  this.httpError = 516;
  this.message = message;
  this.name = this.constructor.name;
}
util.inherits(ParamError516, Error);
exports.errors.ParamError516 = ParamError516;
*/



// Save a log entry onto the Log table, with the current timestamp. Workspace and userId can be empty
exports.Logger = function(workspaceName, userId, logLevel, message, req, data){
  var Log = mongoose.model("Log");
  log = new Log();
  log.workspaceName = workspaceName;
  log.userId = userId;
  log.logLevel = logLevel;
  log.message = message;
  log.reqInfo = JSON.stringify( {info: req.info, headers:req.headers, method:req.method, body:req.body, route:req.route, params:req.params });
  // console.log('Logged: "%s", "%s", "%d", "%s", "%s", "%s"', workspaceName, userId, logLevel, message, log.reqInfo, log.data );  
  data = data || {};
  log.data = JSON.stringify(data);
  log.loggedOn = new Date();
  log.save();
} 


