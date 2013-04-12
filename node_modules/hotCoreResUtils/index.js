
var 
  dummy
, hotplate =  require('hotplate')
, url = require('url')
, e = require('allhttperrors')
;


exports.hotHooks = hooks = {}


/* FIXME: move this somewhere else, even in bd.js, feels wrong here */
exports.currentUserInWorkspaceAccess = function( req, workspaceObject ){
  return  workspaceObject.access.filter( function(o){ 
     return o._id.toString() === req.application.user._id.toString(); } ).length > 0;
}


exports.runtimeErrorIfErr = function( err, next, cb) {

  if( err ){
    next( new e.ServiceUnavailableError( { originalErr: err } ) );
  } else {
    cb();
  }
}




/* Utility functions written before the schema, and still useful to have */

exports.parametersAreMissing = function(obj, attributes, errors, next){

  attributes.forEach(function(attribute){
    if( typeof(obj) === 'undefined' || typeof(obj[attribute]) == 'undefined'){
      errors.push( { field: attribute, message: 'Required attribute not provided: ' + attribute, mustChange: false } );
    }
  });

  if( errors.length && typeof(next) === 'function' ){
    next( new e.ValidationError( "Validation error, missing parameters", errors ) );
    return true;
  }
  return false;
}


exports.parametersAreEmpty = function(obj, attributes, next){

  var errors = [];

  attributes.forEach(function(attribute){
    if( typeof( obj[attribute] ) !== 'undefined' && obj[attribute] == '' ){
      errors.push( { field: attribute, message: 'Value cannot be empty', mustChange: false } );
    }
  });

  return exports.respondIfErrors( errors, next );

}

exports.parametersAllowed = function(obj, allowedFields, next){

  var errors = [];

  for( var k in obj ){
    if( allowedFields.indexOf( k ) == -1 ){
      errors.push( { field: k, message: 'Value not accepted: ' + k, mustChange: false } );
    }
  };
  return exports.respondIfErrors( errors, next );

}

exports.respondIfErrors = function( errors, next ){


  if( errors.length && typeof(next) === 'function' ) {
    next( new e.ValidationError('Validation error', errors ) );
    return true;
  }
  return false;
}



