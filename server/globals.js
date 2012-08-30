
var mongoose = require('mongoose'),
util = require('util');

exports.errors = {};

// Defining the RuntimeError error type, thrown by the application itself when a
// callback comes back with "err" set
//
function RuntimeError503( err ){
  this.httpError = 503;
  this.message = err.message || "Runtime error";
  this.name = this.constructor.name;
  this.originalError = err;
}
util.inherits(RuntimeError503, Error);
exports.errors.RuntimeError503 = RuntimeError503;

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

// Defining the NotLoggedinError error type, thrown by the application itself
//
function BadTokenError403( message ){
  this.httpError = 403;
  this.message = message || "Bad token";
  this.name = this.constructor.name;
}
util.inherits(BadTokenError403, Error);
exports.errors.BadTokenError403 = BadTokenError403;

// Defining the Forbidden error type, thrown by the application itself
// when a resource is requested, but the user has no rights to access it
// FIXME: Check the code, 402 might not be a good one for this sort of thing
//
function ForbiddenError403( message ){
  this.httpError = 403;
  this.message = message || "Not enough privileges for the requested resource";
  this.name = this.constructor.name;
}
util.inherits(ForbiddenError403, Error);
exports.errors.ForbiddenError403 = ForbiddenError403;


// Save a log entry onto the Log table, with the current timestamp. Workspace and userId can be empty
exports.Logger = function(logEntry){
  var Log = mongoose.model("Log"),
      req = logEntry.req;

  log = new Log();

  // Sorts out log.reqInfo
  if ( logEntry.req){
    log.reqInfo = JSON.stringify({
      info   : req.info,
      headers: req.headers,
      method : req.method,
      body   : req.body,
      route  : req.route,
      params : req.params 
    });
  } else {
    logEntry.reqInfo = {};
  }
 
  // req.application.login is always set if the user has logged in

    
  // Set other variables if they are defined (or default to '')
  if( req.application) {
    log.workspaceId   = req.application.workspaceId   ? req.application.workspaceId   : '';
    log.workspaceName = req.application.workspaceName ? req.application.workspaceName : '';
    log.token         = req.application.token         ? req.application.token         : '';
    log.login         = req.application.login         ? req.application.login         : '';
  } else {
    log.workspaceId   = '';
    log.workspaceName = '';
    log.token         = '';
    log.login         = '';
  }

  // Sorts out all of the other fields with sane defaults.
  // FIXME: improve this code, it's grown into something ugly and repetitive
  // http://stackoverflow.com/questions/12171336/saving-an-object-with-defaults-in-mongoose-node
  log.logLevel   = logEntry.logLevel  ? logEntry.logLevel  : 0;
  log.errorName  = logEntry.errorName ? logEntry.errorName : '';
  log.message    = logEntry.message   ? logEntry.message   : '';
  log.data       = logEntry.data      ? logEntry.data      : {};

  // Sorts out log.loggedOn
  log.loggedOn = new Date();
  log.save();
} 


