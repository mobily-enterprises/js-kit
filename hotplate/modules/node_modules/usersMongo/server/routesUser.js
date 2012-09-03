
var utils = require('../../../utils.js'),
fs = require('fs'),
g = require('../../../globals.js'),
mongoose = require('mongoose'),
e = require('../../../errors.js');

eval(fs.readFileSync('../client/validators.js').toString()); // Creates "Validators


function parametersAreThere(obj, attributes, errors){
  attributes.forEach(function(attribute){
    if( typeof(obj[attribute]) == 'undefined'){
      errors.push( { field: attribute, message: 'Required attribute not provided: ' + attribute, mustChange: false } );
    }
  }); 
}


exports.postWorkspacesUser = function(req, res, next){

  // *****
  setTimeout(function(){
  // *****

  var Workspace = mongoose.model('Workspace');
  var User = mongoose.model('User');

  var errors = [];

  // Chuck user out if he's not logged in.
  // TODO: Move this into a middleware
  if(! req.session.loggedIn ){
    next( new e.ForbiddenError403('Not logged in'));
    return; 
  }

  parametersAreThere(req.body, ['workspace'], errors);


  // There were errors: end of story, don't even bother the database
  if(errors.length){
    next( new e.ValidationError422('Soft validation of parameters failed', errors));
    return;
  }


  // Step 1: Check that the workspace is not already taken
  Workspace.findOne({ name:req.body.workspace }, function(err, doc){
    if(err){
      next(new e.RuntimeError503( err ) );
    } else {
      if(doc){
        errors.push( {field: "workspace", message: "Workspace taken, sorry!", mustChange: true} );
        next( new e.ValidationError422('Db-oriented validation of parameters failed', errors));
      } else {

        // Assign values
        var w = new Workspace();
        w.name = req.body.workspace;
        w.activeFlag = true;
        utils.makeToken( function(err, token) {
          if(err){
             next(new e.RuntimeError503( err ) );
          } else {
            w.access = {  userId: req.session.userId, token:token, isOwner: true }; 
            w.save( function(err){
              if(err){
                 next(new e.RuntimeError503( err ) );
                 console.log(err);
              } else{

                // Register the workspace, and return the worksapce Id in as an option (to allow redirect)
                utils.sendResponse( res, { data: { workspaceId: w._id } } ); 

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



exports.postLogoutUser = function(req, res, next){

  // *****
  setTimeout(function(){
  // *****

    // There is nothing to be checked: simply logs out by clearing the session variables
    // NOTE: req.session.login is properly set to null as the user really wanted to logout
    req.session.loggedIn = false;
    req.session.login = null;

    // Send an OK response. It's up to the client to redirect/etc.
    utils.sendResponse( res, { } );

  //
  } , 500); // Artificial timeout
  //

}

