"use strict";

var dummy
  , hotplate = require('hotplate')
  , path = require('path')
;


// exports.sendResponse = function(method, res, obj){
exports.sendResponse = function(res, obj, status){

  var status;
  var isOK;

  status = status || 200;

  isOK =  (status >= 200 && status < 300) || // allow any 2XX error code
           status === 304;                   // or, get it out of the cache

  if( isOK ){
    res.status( status ).json( obj );
  } else {

    obj = typeof(obj) == 'object' ? obj : { };

    var error = {};

    // Assign "legal" keys
    if( obj.message ) error.message = obj.message;
    if( obj.errors )  error.errors  = obj.errors;
    if( obj.data )    error.data    = obj.data;  
    if( obj.emit )    error.emit    = obj.emit;

    res.status( status ).json( error );
  }
}

hotplate.hotEvents.onCollect( 'pageElements', 'hotCoreErrorProtocol', function( done ){

  done( null, {
    jses:  [ 'hotFixErrorResponse.js']
  });

});

hotplate.hotEvents.onCollect( 'clientPath', 'hotCoreErrorProtocol', function( done ){
  done( null, path.join(__dirname, '../client') );
})



