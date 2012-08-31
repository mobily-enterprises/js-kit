
var utils = require('../utils.js'),
fs = require('fs'),
g = require('../globals.js'),
mongoose = require('mongoose'),
e = require('../errors.js');
eval(fs.readFileSync('../client/validators.js').toString()); // Creates "Validators


function parametersAreThere(obj, attributes, errors){
  attributes.forEach(function(attribute){
    if( typeof(obj[attribute]) == 'undefined'){
      errors.push( { field: attribute, message: 'Required attribute not provided: ' + attribute, mustChange: false } );
    }
  }); 
}


/*
  RESTful call: getWorkspaceAnon
  Example     : GET /WorkspaceAnon?name=something
  Params      : * name: Mandatory. Workspace name
  Notes       : It's an anonymous RESTful call to check if a workspace is
                taken or not. Used in registration form. It will never
                work as a generic filter, and that's why the parameter is required
*/
exports.getWorkspacesAnon = function(req, res, next){

  var name = req.query.name;


  // Looks for a workspace. If it's there, answers without errors. If not,
  // answers with a very short error
  Workspace = mongoose.model('Workspace');
  if( ! name){
    next(new e.ValidationError422("'name' filter not passed", { name: 'parameter required'}) );
  } else {
    Workspace.findOne({ name: name }, function(err, doc){
      if(err ){
        next(new e.RuntimeError503( err ) );
      } else {
        // Note: returns a simplified version of the record as
        // this is asked from an anonymous source
        if(doc){
          utils.sendResponse( res, { data: [ { name: name } ]  } ); 
        } else {
          utils.sendResponse( res, { data: []  } ); 
       }
      }
    });
  }

}
/*
  RESTful call: getUsersAnon
  Example     : GET /UsersAnon?login=something
  Params      : * login: Mandatory. Login name
  Notes       : It's an anonymous RESTful call to check if a login name is
                taken or not. Used in registration form. It will never
                work as a generic filter, and that's why the parameter is required
*/
exports.getUsersAnon = function(req, res, next){

  var login = req.query.login;
  console.log("Login is: " + login);

  // Looks for a workspace. If it's there, answers without errors. If not,
  // answers with a very short error
  User = mongoose.model('User');
  if( ! login){
    next(new e.ValidationError422("'login' filter not passed", { name: 'parameter required'}) );
  } else {
    User.findOne({ login: login }, function(err, doc){
      if(err ){
        next(new e.RuntimeError503( err ) );
      } else {
        // Note: returns a simplified version of the record as
        // this is asked from an anonymous source
        if(doc){
          utils.sendResponse( res, { data: [ { login:login } ]  } ); 
        } else {
          utils.sendResponse( res, { data: []  } ); 
       }
      }
    });
  }

}


exports.postWorkspacesAnon = function(req, res, next){

  // *****
  setTimeout(function(){
  // *****

  var errors = [];
  var Workspace = mongoose.model("Workspace");
  var User = mongoose.model("User");


  // **************************************************************
  // PHASE #1: SOFT VALIDATION (NO DB INTERACTION YET)
  //           "Because you cannot trust Javascript validation"
  // **************************************************************


  parametersAreThere(req.body, ['password', 'workspace', 'login', 'email'], errors);

  // There were errors: end of story, don't even bother the database
  if(errors.length){
    next( new e.ValidationError422('Validation error in some fields', errors));
    return;
  }

  // Check if the password matches.
  // This will populate "errors", which will make things stop even if
  // user and workspace are not taken
  if( req.body.password[0] != req.body.password[1] ){
    errors.push( { field: 'password', message: 'Password does not match', mustChange: false } );
  }

  // Validate workspace
  var validatorWorkspace = Validators.workspace(req.body.workspace);
  if( ! validatorWorkspace.result ){
    errors.push( {field: 'workspace' , message: validatorWorkspace.message });
  }

  // Validate user name
  var validatorLogin = Validators.login(req.body.login);
  if( ! validatorLogin.result ){
    errors.push( {field: 'login' , message: validatorLogin.message });
  }

  // Validate email
  var validatorEmail = Validators.email(req.body.email);
  if( ! validatorEmail.result ){
    errors.push( {field: 'email' , message: validatorEmail.message });
  }

  // There were errors: end of story, don't even bother the database
  if(errors.length){
    next( new e.ValidationError422('Soft validation of parameters failed', errors));
    return;
  }
    
  // *******************************************************
  // PHASE #1: ADDING RECORDS TO DB (WITH CHECKS)
  // *******************************************************

  User.findOne( { login: req.body.login}, function(err, doc){
    // Log database error if it's there
    if(err ){
      next(new e.RuntimeError503( err ) );
    } else {
      // If the user exists, add it to the error vector BUT keep going
      if(doc){
        errors.push({ field:'login', message: 'Login name taken, sorry!', mustChange: true } );
      }
      Workspace.findOne({ name: req.body.workspace }, function(err, doc){
        if(err ){
          next(new e.RuntimeError503( err ) );
        } else {
          if(doc){
            errors.push( {field: "workspace", message: "Workspace taken, sorry!", mustChange: true} );
          } 

          // Check if there are any errors -- if so, return them and that's it
          if( errors.length ){
            next( new e.ValidationError422('Db-oriented validation of parameters failed', errors));
          } else { 

            //
            // AT THIS POINT, UNLESS SOMETHING JUMPS ON US, both user and workspace are available
            //

            // User doesn't exist: create it
            var u = new User();
            u.login = req.body.login;
            u.password = req.body.password[0];
            u.email = req.body.email;
            u.workspaceIds = [];
 
            u.save( function(err) {
              if(err){
                next( new e.RuntimeError503( err ) );
              } else {
                var w = new Workspace();
                w.name = req.body.workspace;
                w.activeFlag = true;

                utils.makeToken( function(err, token) {
                  if(err){
                    next(new e.RuntimeError503( err ) );
                  } else {
                    w.access = {  userId: u._id, token:token, isOwner: true };
                    w.save( function(err){
                      if(err ){
                        next( new e.RuntimeError503( err ) );
                      } else{
                        // Login and password correct: user is logged in, regardless of what workspace they were requesting access for.
                        req.session.loggedIn = true;
                        req.session.login = req.body.login;
                        req.session.userId = u._id;

                        utils.sendResponse( res, { data: { workspaceId: w._id } } );
                      }
                    }) // w.save()
                  } 
                }) // utils.makeToken()

              }
            }) // u.save

          } // if(errors.length != 0)
        }
      }) // Workspace.findOne()
    }
  }); // User.findOne()


  //
  } , 500); // Artificial timeout
  //

}



exports.postRecoverAnon = function(req, res, next){

  // *****
  setTimeout(function(){
  // *****

  var errors = [];
  var Workspace = mongoose.model("Workspace");
  var User = mongoose.model("User");



  // **************************************************************
  // PHASE #1: SOFT VALIDATION (NO DB INTERACTION YET)
  //           "Because you cannot trust Javascript validation"
  // **************************************************************

  // Validate email
  var validatorEmail = Validators.email(req.body.email);
  if( ! validatorEmail.result ){
    errors.push( {field: 'email' , message: validatorEmail.message });
  }

  // There were errors: end of story, don't even bother the database
  if(errors.length){
    next( new e.ValidationError422('Soft validation of parameters failed', errors));
    return;
  }
    
  // *******************************************************
  // PHASE #1: ADDING RECORDS TO DB (WITH CHECKS)
  // *******************************************************

  User.findOne( { login: req.body.email }, function(err, doc){
    // Log database error if it's there
    if(err ){
      next(new e.RuntimeError503( err ) );
    } else {
      // If the user exists, add it to the error vector BUT keep going
      if(doc){
        console.log("Sending email for " + doc.email);
        // TODO: SEND EMAIL USING NEW EMAIL INFRASTRUCTURE
      }
      utils.sendResponse( res, { } );
    }
  }); // User.findOne()

  //
  } , 500); // Artificial timeout
  //

}

exports.postLoginAnon = function(req, res, next){

  // *****
  setTimeout(function(){
  // *****

  var errors = [],
      User = mongoose.model("User"),
      Workspace = mongoose.model("Workspace");


  // **************************************************************
  // PHASE #1: SOFT VALIDATION (NO DB INTERACTION YET)
  //           "Because you cannot trust Javascript validation"
  // **************************************************************




  // **************************************************************
  // PHASE #1: SOFT VALIDATION (NO DB INTERACTION YET)
  //           "Because you cannot trust Javascript validation"
  // **************************************************************
    
  // Validate user name
  var validatorLogin = Validators.login(req.body.login); // FIXME: If field is empty, this KILLS node
  if( ! validatorLogin.result ){
    errors.push( {field: 'login' , message: validatorLogin.message });
  }

  // There were errors: end of story, don't even bother the database
  if(errors.length){
    next( new e.ValidationError422('Soft validation of parameters failed', errors));
    return;
  }
    
  // *******************************************************
  // PHASE #2: POST THE DATA
  // Note: since we are posting username/password,
  // 
  // *******************************************************

  var forWorkspaceId = '';
  User.findOne( { login: req.body.login}, function(err, docUser){
    // Log database error if it's there
    if(err ){
      next(new e.RuntimeError503( err ) );
    } else {
      // Password is incorrect: return errors
      if(! docUser || docUser.password != req.body.password){
          errors.push({ field:'password', message: 'Password incorrect', mustChange: false } );
          errors.push({ field:'', message: 'Login failed' });
          next( new e.ValidationError422('Soft validation of parameters failed', errors));
      } else {
        if( docUser.password == req.body.password ) {

                    
          // Login and password correct: user is logged in, regardless of what workspace they were requesting access for.
          req.session.loggedIn = true;
          req.session.login = req.body.login;
          req.session.userId = docUser._id;

          // The client requested a login for a specific workspace name: attempt to set forWorkspaceId (if they have
          // access to that specific workspace)
          if( req.body.workspaceName != ''){

            User.findOne( { login: req.body.login } , function( err, docUser){
              if(err){
                 next(new e.RuntimeError503( err ) );
              } else {
                

                Workspace.findOne( { 'name': req.body.workspaceName, 'access.userId' : docUser._id }, function(err, docWorkspace){
                  if(err ){
                    next(new e.RuntimeError503( err ) );
                  } else {
                    if(docWorkspace){
                      forWorkspaceId = docWorkspace._id;
                    }
                    utils.sendResponse( res, { data: { forWorkspaceId: forWorkspaceId } } );
                  }
                }); // Workspace.findOne(
              }
            }); //  User.findOne( 

          } // if( req.body.workspaceName != ''){


          // There was no specific requirement in terms of workspace, just return OK with empty forWorkspaceId
          else {

            // Finally send the OK response, which might or might not have forWorkspace set
            utils.sendResponse( res, { data: { forWorkspaceId: '' } } );

          } // ELSE ( if( req.body.workspaceName != ''){ )


        } //if( docUser.password == req.body.password ) {
      }
    }
  }); // User.findOne()


  //
  } , 500); // Artificial timeout
  //

}


