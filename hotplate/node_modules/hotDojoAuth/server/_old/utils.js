var hat = require('hat'),
mongoose = require('mongoose');

exports.makeToken = function( callback ){

  var attempts = 0;
  look();

  function look(){
    Workspace = mongoose.model("Workspace");

    // Generate the token, check that it's indeed available
    var token = hat();
    Workspace.findOne( { 'access.token':token } , function(err, doc){

      // There is an error: call the callback returning an error
      if(err){
        callback(err, null);
      } else {

        // Token already there: either give up (too many attempts)...
        if( doc ){
          attempts ++;
          if( attempts == 5 ){
            callback( new Error("Cannot generate unique token"), null );
          } else {
            look();
          }    
        // ... or try again by calling this function again!
        } else {
          callback(null, token );
        }
      }
    });
  }
}

// Ideally, you can call `sendResponse( res, { ack:'OK' } and the rest is optional );
// However, a new object is created because we should be strict about the format
// of the object sent back to the client
// 
// On the other side, `readResponse()` will make sure that no matter what was sent,
// the response will have at least "ack" and empty objects for the parameters
// that weren't passed.
//

/*
// Moved to the right module 
exports.sendResponse = function(res, params){

  var response = {},
  status;
 
  // Safety check, in case nothing was passed
  // (it will still work, it will just send an OK 200)
  params = typeof(params) == 'object' ? params : { };
 
  // Set the status variable
  status = params.status || 200;

  // Set some defaults
  response.ack = params.ack || 'OK';
  
  // Assign default parameters
  if( params.message ) response.message = params.message;
  if( params.errors )  response.errors  = params.errors;
  if( params.data )    { console.log("DATA " + params.data); response.data    = params.data; } 
  if( params.emit )    response.emit    = params.emit;

  res.json(response, status);
}
*/


exports.ObjectIdCheck = function(s){
  return new RegExp("^[0-9a-fA-F]{24}$").test(s);
}

  
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
    log.workspaceId   = req.application.workspaceId   ? req.application.workspaceId   : null;
    log.workspaceName = req.application.workspaceName ? req.application.workspaceName : '';
    log.userId        = req.application.userId        ? req.application.userId        : null;
    log.login         = req.application.login         ? req.application.login         : '';
    log.token         = req.application.token         ? req.application.token         : '';
  } else {
    log.workspaceId   = null;
    log.workspaceName = '';
    log.userId        = null;
    log.login         = '';
    log.token         = '';
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


