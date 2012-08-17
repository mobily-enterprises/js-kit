
var util = require('util'),
fs = require('fs'),
g = require('../globals.js'),
mongoose = require('mongoose');
eval(fs.readFileSync('../client/validators.js').toString()); // Creates "Validators



function parametersAreThere(obj, attributes, errors){
  attributes.forEach(function(attribute){
    if( typeof(obj[attribute]) == 'undefined'){
      errors.push( { field: attribute, message: 'Required attribute not provided: ' + attribute, mustChange: false } );
    }
  }); 
}





exports.postTest = function(req, res, next){

  // *****
  setTimeout(function(){
  // *****


  // Chuck user out if he's not logged in.
  // TODO: Move this into a middleware
  // (And DEFINITELY out of a function that is meant to work for anonymous)
  if(! req.session.loggedIn ){
    next( new g.errors.ForbiddenError403());
    return; 
  }

  req.session.loggedIn = false;
  res.json( { response: 'OK' } , 200);


  //
  } , 500); // Artificial timeout
  //

}


