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
