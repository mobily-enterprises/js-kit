/*!
 * Module dependencies.
 */

var util = require('util')
  , hotplate = require('hotplate')
  , path = require('path')
  , e = require('allhttperrors')
  , logger = require('hotplate/core_modules/hotCoreServerLogger')
  , debug = require('debug')('hotplate:hotCoreError')
;

// Default functions that will send responses back

hotplate.config.set('hotCoreError.errorPage', function( req, res, next ){
  var errorString = "ERROR: " + req.hotError + ", NAME: " + req.hotError.name;
  res.send( errorString + " -- CUSTOMISE YOUR ERROR PAGE BY SETTING hotCoreError.errorPage IN YOUR SERVER FILE");
});


hotplate.config.set('hotCoreError.sendAjaxErrorResponse', function( res, obj, status ){

  obj = typeof( obj ) == 'object' ? obj : { };

  var error = {};

  // Assign "legal" keys
  if( obj.message ) error.message = obj.message;
  if( obj.errors )  error.errors  = obj.errors;

  res.status( status ).json( error );
});



// Sets logLEvels for errors, _and_ sets some more friendly defaults in terms of messages etc.

Object.keys( e ).forEach( function( o ){

  var proto = e[ o ].prototype;

  switch( o ){
    case 'ServiceUnavailableError':
      proto.logLevel = 5;
      proto.message = "Server error";
    break;

    case 'BadRequestError':
      proto.logLevel = 2;
    break;

    case 'UnprocessableEntityError':
      proto.logLevel = 2;
      proto.message = "Validation Error";
    break;

  }
})


exports.hotCoreErrorHandler = function( err, req, res, next){

  var accept = req.headers.accept || '';

  // This function will do two things:
  // * Log the problem, setting the right loglevels and attempting to assign the
  //   log line to a specific workspace, depending on the request's header
  // *

  // Debug information: info about error handled
  debug( "Server handled an error: %o", err );

  // *****************************
  // **  LOGGING PART           **
  // *****************************

  // It's not an HTTP error: make a "system" log entry for it, with high priorty
  // This is bad -- these errors must be checked regularly. They will also print out
  // on the console with the error's stack etc.
  if( typeof( e[ err.name ] ) === 'undefined' ){

    var l = {
      logLevel: 3,
      error: err,
      system: true
    }


  // It's an HTTP error: make a "common" entry for it
  } else {

    //err.stack = '';

    var l = {
      logLevel: 1,
      error: err,
    }

    // Raise the loglevel for certain error types
    if (err.name == 'UnauthorizedError' || err.name == 'ForbiddenError' ) l.logLevel = 2;
  }

  // Actually log the problem!

  logger.log( l, req );

  // *****************************
  // **  SERVER RESPONSE PART   **
  // *****************************

  // It's not an HTTP error: make up a new one, and incapsulate original error in it
  if( typeof( e[ err.name ] ) === 'undefined'  ){
    err = new e.ServiceUnavailableError( { originalErr: err } );
  }

  // At this point, the error is "safe" to be sent back. The user will never see
  // a Javascript error, as anything other than HTTP errors are wrapped around
  // ServiceUnavailableError).
  // The way the error is relayed back to the user depends on their request

  // If it was an HTML page that generated the error, return hotplate's error page
  if( ~accept.indexOf('html') ){
    req.hotError = err; // FIXME
    hotplate.config.get('hotCoreError.errorPage')(req, res, next);

    console.log("Returned page with error because of:", require('util').inspect( err, { depth: 10 } ) );

  // If it was a JSON request, do a sendResponse following the protocol
  } else {
    var sendResponse = hotplate.config.get('hotCoreError.sendAjaxErrorResponse' );
    sendResponse( res, { message: err.message, errors: err.errors }, err.httpError );
  }
}


// exports.sendResponse = function(method, res, obj){
