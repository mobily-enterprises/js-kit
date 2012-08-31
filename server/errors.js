util = require('util');

var exports = module.exports = {};

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
exports.RuntimeError503 = RuntimeError503;

// Defining the NotFoundError error type, thrown by the application itself
//
function NotFoundError404( message ){
  this.httpError = 404;
  this.message = message || 'Action not found';
  this.name = this.constructor.name;
}
util.inherits(NotFoundError404, Error);
exports.NotFoundError404 = NotFoundError404;

// Defining the ValidationError error type, thrown by the application itself
//
function ValidationError422( message , errors ){
  this.httpError = 422;
  this.message = message  || "Parameters validation error";
  this.errors = errors || [];
  this.name = this.constructor.name;
}
util.inherits(ValidationError422, Error);
exports.ValidationError422 = ValidationError422;

// Defining the NotLoggedinError error type, thrown by the application itself
//
function BadTokenError403( message ){
  this.httpError = 403;
  this.message = message || "Bad token";
  this.name = this.constructor.name;
}
util.inherits(BadTokenError403, Error);
exports.BadTokenError403 = BadTokenError403;

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
exports.ForbiddenError403 = ForbiddenError403;

