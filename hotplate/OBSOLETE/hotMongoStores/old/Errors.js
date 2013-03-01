
var 
  dummy
, util = require('util')
;

var e = {};
exports = module.exports = e;

e['NotImplementedError'] = function(err){
  this.httpError = 501;
  this.message = "Method not implemented";
  this.name = 'NotImplementedError';
  this.sendResponse = true;
  this.logLevel = 4;
}
util.inherits(e['NotImplementedError'], Error);

e['RuntimeError'] = function(err){
  this.httpError = 503;
  this.message = "Runtime error";
  this.name = 'RuntimeError';
  this.originalError = err;
  this.sendResponse = true;
  this.logLevel = 5;
}
util.inherits(e['RuntimeError'], Error);

e['BadRequestError'] = function( message, errors ){
  this.httpError = 400;
  this.message = message || 'Bad request';
  this.name = 'BadRequestError';
  this.sendResponse = true;
  this.logLevel = 2;
  this.errors = errors;
}
util.inherits(e['BadRequestError'], Error);

e['NotFoundError'] = function( message ){
  this.httpError = 404;
  this.message = message || 'Resource not found';
  this.name = 'NotFoundError';
  this.sendResponse = true;
  this.logLevel = 3;
}
util.inherits(e['NotFoundError'], Error);

e['ValidationError'] = function( message, errors ){
  this.httpError = 422;
  this.message = message || 'Validation problem';
  this.name = 'ValidationError';
  this.sendResponse = true;
  this.logLevel = 2;
  this.errors = errors;
}
util.inherits(e['ValidationError'], Error);


e['UnauthorizedError'] = function( message ){
  this.httpError = 401;
  this.message = message || 'Login necessary to access the requested resource';
  this.name = 'UnauthorizedError';
  this.sendResponse = true;
  this.logLevel = 3;
}
util.inherits(e['UnauthorizedError'], Error);

e['ForbiddenError'] = function( message ){
  this.httpError = 403;
  this.message = message || 'Access to resource denied';
  this.name = 'ForbiddenError';
  this.sendResponse = true;
  this.logLevel = 3;
}
util.inherits(e['ForbiddenError'], Error);
 
e['PreconditionFailedError'] = function( message ){
  this.httpError = 412;
  this.message = message || 'Access to resource denied';
  this.name = 'PreconditionFailedError';
  this.sendResponse = true;
  this.logLevel = 3;
}
util.inherits(e['PreconditionFailedError'], Error);
 
