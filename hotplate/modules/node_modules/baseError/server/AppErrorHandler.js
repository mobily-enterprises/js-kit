

var protocol = require('baseProtocol'),
    hotplate = require('hotplate');

Logger = hotplate.Logger;


exports.AppErrorHandler = function( err, req, res, next){

  var logLevel;

  switch(err.name){

    // Validation error: like the others, but return the list of err.errors
    // as well as the error message
    case 'ValidationError422':
      logLevel = 3;
      protocol.sendResponse( res, { ack: 'ERROR', message: err.message, errors: err.errors, status: err.httpError } );
    break;

    // Common custom-made errors. They all do the same thing: return the error as err.message and
    // sets the HTTP error according to the error's
    case 'ForbiddenError403':
    case 'BadTokenError403':
    case 'NotFoundError404':
    case 'RuntimeError503':
      logLevel = 4;
      protocol.sendResponse( res, { ack: 'ERROR', message: err.message, status: err.httpError } );
    break;

    // Unexpected errors. These really shouldn't happen. Will return a generic
    // HTTP error 500, and will be logged with higher urgency
    default:
      console.log(err.stack);
      logLevel = 5;
      protocol.sendResponse( res, { ack: 'ERROR', message: err.message, status: 500 } );
    break;
  } 

  Logger({
    logLevel     : logLevel,
    errorName    : err.originalError ? err.originalError.name    : err.name,
    message      : err.originalError ? err.originalError.message : err.message,
    req          : req,
    data         : { error: err },
  });

}



