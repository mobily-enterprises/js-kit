
var 
  dummy
, util = require('util')
;

var e = {};
exports = module.exports = e;

e['BadRequestError'] = function( message, errorFields ){
  this.httpError = 400;
  this.message = message || 'Bad request';
  this.name = 'BadRequestError';
  this.errorFields = errorFields;
}
util.inherits(e['BadRequestError'], Error);

e['UnauthorizedError'] = function( message ){
  this.httpError = 401;
  this.message = message || 'Login necessary to access the requested resource';
  this.name = 'UnauthorizedError';
}
util.inherits(e['UnauthorizedError'], Error);

e['ForbiddenError'] = function( message ){
  this.httpError = 403;
  this.message = message || 'Access to resource denied';
  this.name = 'ForbiddenError';
}
util.inherits(e['ForbiddenError'], Error);

e['NotFoundError'] = function( message ){
  this.httpError = 404;
  this.message = message || 'Resource not found';
  this.name = 'NotFoundError';
}
util.inherits(e['NotFoundError'], Error);
 
e['PreconditionFailedError'] = function( message ){
  this.httpError = 412;
  this.message = message || 'Precondition failed';
  this.name = 'PreconditionFailedError';
}
util.inherits(e['PreconditionFailedError'], Error);

e['ValidationError'] = function( message, errorFields ){
  this.httpError = 422;
  this.message = message || 'Validation problem';
  this.name = 'ValidationError';
  this.errorFields = errorFields;
}
util.inherits(e['ValidationError'], Error);

e['NotImplementedError'] = function( message ){
  this.httpError = 501;
  this.message = message || "Method not implemented";
  this.name = 'NotImplementedError';
}
util.inherits(e['NotImplementedError'], Error);

e['RuntimeError'] = function( message, originalErr ){
  this.httpError = 503;
  this.message = message || "Runtime error";
  this.name = 'RuntimeError';
  this.originalError = originalErr;
}
util.inherits(e['RuntimeError'], Error);


