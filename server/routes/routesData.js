
var utils = require('../utils.js'),
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


exports.postWorkspaces = function(req, res, next){

  // *****
  setTimeout(function(){
  // *****

  var Workspace = mongoose.model('Workspace');
  var User = mongoose.model('User');

  var errors = [];

  // Chuck user out if he's not logged in.
  // TODO: Move this into a middleware
  if(! req.session.loggedIn ){
    next( new g.errors.ForbiddenError403());
    return; 
  }

  parametersAreThere(req.body, ['workspace'], errors);


  // There were errors: end of story, don't even bother the database
  if(errors.length){
    next( new g.errors.ValidationError422('Soft validation of parameters failed', errors));
    return;
  }


  // Step 1: Check that the workspace is not already taken
  Workspace.findOne({ name:req.body.workspace }, function(err, doc){
    if(err){
      next(new g.errors.BadError503("Database error fetching workspace") );
    } else {
      if(doc){
        errors.push( {field: "workspace", message: "Workspace taken, sorry!", mustChange: true} );
        next( new g.errors.ValidationError422('Db-oriented validation of parameters failed', errors));
      } else {

        // Assign values
        var w = new Workspace();
        w.name = req.body.workspace;
        w.activeFlag = true;
        utils.makeToken( function(err, token) {
          if(err){
             next(new g.errors.BadError503("Could not generate token") );
          } else {
            w.access = {  login: req.session.login, token:token, isOwner: true }; 
            w.save( function(err){
              if(err){
                 next(new g.errors.BadError503("Database error saving workspace") );
              } else{

                // Register the workspace, and return the worksapce Id in as an option (to allow redirect)
                res.json( { response: 'OK', workspaceId: w._id } , 200); // OOOOKKKKKKKKKK!!!!!!!!!!

              }
            }); // w.save
          }
        }); // utils.makeToken
      }
    }
  }); // Workspace.findOne


  //
  } , 500); // Artificial timeout
  //

}





