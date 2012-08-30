
var util = require('util'),
fs = require('fs'),
Logger = require('./globals.js').Logger,
utils = require('./utils.js'); 

exports.AppErrorHandler = function( err, req, res, next){

  // Set the basic variables for logging. FIXME: to be completed. This info is
  // not alwaysavailable
  var logLevel;

  switch(err.name){

    // Validation error: like the others, but return the list of err.errors
    // as well as the error message
    case 'ValidationError422':
      logLevel = 3;
      utils.sendResponse( res, { ack: 'ERROR', message: err.message, errors: err.errors, status: err.httpError } );
    break;

    // Common custom-made errors. They all do the same thing: return the error as err.message and
    // sets the HTTP error according to the error's
    case 'ForbiddenError403':
    case 'BadTokenError403':
    case 'NotFoundError404':
    case 'RuntimeError503':
      logLevel = 4;
      utils.sendResponse( res, { ack: 'ERROR', message: err.message, status: err.httpError } );
    break;

    // Unexpected errors. These really shouldn't happen. Will return a generic
    // HTTP error 500, and will be logged with higher urgency
    default:
      console.log(err.stack);
      logLevel = 5;
      utils.sendResponse( res, { ack: 'ERROR', message: err.message, status: 500 } );
    break;
  } 

  // Log the event (as an error, obviously)
  Logger({
    logLevel     : logLevel,
    errorName    : err.originalError ? err.originalError.name    : err.name,
    message      : err.originalError ? err.originalError.message : err.message,
    req          : req,
    data         : { error: err },
  });

  
}



