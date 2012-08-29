
var util = require('util'),
fs = require('fs');
Logger = require('./globals.js').Logger,

exports.AppErrorHandler = function( err, req, res, next){

  // Set the basic variables for logging. FIXME: to be completed. This info is
  // not alwaysavailable
  var user = null;
  var workspace = null;   
  var logLevel;

  switch(err.name){

    // Validation error: like the others, but return the list of err.errors
    // as well as the error message
    case 'ValidationError422':
      logLevel = 3;
      res.json(err.errors, err.httpError)
    break;

    // Common custom-made errors. They all do the same thing: return the error as err.message and
    // sets the HTTP error according to the error's
    case 'ForbiddenError403':
    case 'NotLoggedinError403':
    case 'NotFoundError404':
    case 'RuntimeError503':
      logLevel = 4;
      res.json( { message: err.message }, err.httpError );
    break;

    // Unexpected errors. These really shouldn't happen. Will return a generic
    // HTTP error 500, and will be logged with higher urgency
    default:
      logLevel = 5;
      res.json( { message: err.message } , 500 );
      console.log(err.stack);
    break;
  } 

  // Log the event (as an error, since it has 
  Logger({
    logLevel     : logLevel,
    errorName    : err.originalError ? err.originalError.name    : err.name,
    message      : err.originalError ? err.originalError.message : err.message,
    req          : req,
    data         : {},
  });

  
}



