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

      // There is an error: throw it straight away
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
  if( params.data )    response.data    = params.data;
  if( params.emit )    response.emit    = params.emit;

  res.json(response, status);
}



