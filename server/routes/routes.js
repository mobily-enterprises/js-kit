
/*
 * GET home page. Ths is a one page app, so there is not much
 * happening in terms of layout etc. I will serve the page as a
 * jade template though
 */
// http://ajax.googleapis.com/ajax/libs/dojo/1.7.2/dojo/dojo.js',data-dojo-config="async:true


/*
NOTE: 
return a 404; if a user doesn't have enough privileges to make that Ajax call, return a 403.
*/

var util = require('util'),
fs = require('fs'),
g = require('../globals.js'),
mongoose = require('mongoose');

/**
 * "Borrowed" client-side validators. This will create the global
 * variable "Validators"
 */

eval(fs.readFileSync('../client/validators.js').toString());


// ******************************
// The four pages in the whole
// application
// ******************************
exports.index = function(req, res){
  res.render('index',  {layout:false} );
};

exports.login = function(req, res){
  res.render('login',  {layout:false} );
};

exports.recover = function(req, res){
  res.render('recover',  {layout:false} );
};

exports.register = function(req, res){
  res.render('register',  {layout:false} );
};


/* 
 ****************************************************************
 ****************************************************************
 ****************************************************************
 * UTILITY AND SUPPORT FUNCTIONS
 ****************************************************************
 ****************************************************************
 ****************************************************************
*/

function parametersAreThere(obj, attributes, errors){
  attributes.forEach(function(attribute){
    if( typeof(obj[attribute]) == 'undefined'){
      errors.push( { field: attribute, message: 'Required attribute not provided: ' + attribute, mustChange: false } );
    }
  }); 
}


/* 
 ****************************************************************
 ****************************************************************
 ****************************************************************
 * DATA FUNCTIONS (TO BE USED WITH JSONREST)
 ****************************************************************
 ****************************************************************
 ****************************************************************
*/

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
    next(new g.errors.ValidationError422("'name' filter not passed", { name: 'parameter required'}) );
  } else {
    Workspace.findOne({ name: name }, function(err, doc){
      if(err ){
        next(new g.errors.BadError503("Database error fetching workspace") );
      } else {
        // Note: returns a simplified version of the record as
        // this is asked from an anonymous source
        if(doc){
          res.json( [{name:name}] );
        } else {
          res.json( [] );
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

  // Looks for a workspace. If it's there, answers without errors. If not,
  // answers with a very short error
  User = mongoose.model('User');
  if( ! login){
    next(new g.errors.ValidationError422("'login' filter not passed", { name: 'parameter required'}) );
  } else {
    User.findOne({ login: login }, function(err, doc){
      if(err ){
        next(new g.errors.BadError503("Database error fetching workspace") );
      } else {
        // Note: returns a simplified version of the record as
        // this is asked from an anonymous source
        if(doc){
          res.json( [{user:user}] );
        } else {
          res.json( [] );
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


  // Is the user logged in?
  if(! req.session.loggedIn ){
    next( new g.errors.ForbiddenError403());
    return; 
  }
  req.session.loggedIn = false;

  // **************************************************************
  // PHASE #1: SOFT VALIDATION (NO DB INTERACTION YET)
  //           "Because you cannot trust Javascript validation"
  // **************************************************************


  parametersAreThere(req.body, ['password', 'workspace', 'login', 'email'], errors);

  // There were errors: end of story, don't even bother the database
  if(errors.length){
    next( new g.errors.ValidationError422('Soft validation of parameters failed', errors));
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
    next( new g.errors.ValidationError422('Soft validation of parameters failed', errors));
    return;
  }
    
  // *******************************************************
  // PHASE #1: ADDING RECORDS TO DB (WITH CHECKS)
  // *******************************************************

  User.findOne( { login: req.body.login}, function(err, docs){
    // Log database error if it's there
    if(err ){
      next(new g.errors.BadError503("Database error fetching user") );
    } else {
      // If the user exists, add it to the error vector BUT keep going
      if(docs){
        errors.push({ field:'login', message: 'Login name taken, sorry!', mustChange: true } );
      }
      Workspace.findOne({ name: req.body.workspace }, function(err, docs){
        if(err ){
          next(new g.errors.BadError503("Database error fetching workspace") );
        } else {
          if(docs){
            errors.push( {field: "workspace", message: "Workspace taken, sorry!", mustChange: true} );
          } 

          // Check if there are any errors -- if so, return them and that's it
          if( errors.length ){
            next( new g.errors.ValidationError422('Db-oriented validation of parameters failed', errors));
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
                next( new g.errors.BadError503("Database error saving user") );
              } else {
                var w = new Workspace();
                w.name = req.body.workspace;
                w.activeFlag = true;
                w.ownerUserId = u._id;
                w.countryId = null;
                w.save( function(err){
                  if(err ){
                    next( new g.errors.BadError503("Database error saving workspace. User created, but no workspace assigned") );
                  } else{
                    res.json( { response: 'OK' } , 200); // OOOOKKKKKKKKKK!!!!!!!!!!
                  }
                }) // w.save()
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


/* 
 ****************************************************************
 ****************************************************************
 ****************************************************************
 * NON-DATA CALLS (still using JsonRest for consistency)
 ****************************************************************
 ****************************************************************
 ****************************************************************
*/


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
    next( new g.errors.ValidationError422('Soft validation of parameters failed', errors));
    return;
  }
    
  // *******************************************************
  // PHASE #1: ADDING RECORDS TO DB (WITH CHECKS)
  // *******************************************************

  User.findOne( { login: req.body.email }, function(err, docs){
    // Log database error if it's there
    if(err ){
      next(new g.errors.BadError503("Database error fetching user") );
    } else {
      // If the user exists, add it to the error vector BUT keep going
      if(docs){
        console.log("Sending email for " + docs.email);
        // TODO: SEND EMAIL USING NEW EMAIL INFRASTRUCTURE
      }
      res.json( { response: 'OK' } , 200);
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

  var errors = [];
  var User = mongoose.model("User");



  // **************************************************************
  // PHASE #1: SOFT VALIDATION (NO DB INTERACTION YET)
  //           "Because you cannot trust Javascript validation"
  // **************************************************************



  var login;

  // FIXME: Take this out. This is horrible. Client NEEDS to resend their
  // login name...
  // If no "login" is offered, it will look in the ession. This way, this
  // call can be used by just supplying the password if the user
  // is already logged in
  if( typeof(req.body.login) != 'undefined' ){
    login = req.body.login;
  } else {
    if( typeof(req.session.login) != 'undefined'){
      login = req.body.login;
    } else {

      // This will definitely return errors. Doing it this way so that
      // it will set the default error message
      parametersAreThere(req.body, ['login'], errors); 

      // Call the error handler, 422 will return all errors
      next( new g.errors.ValidationError422('Soft validation of parameters failed', errors));
    }
  }


  // **************************************************************
  // PHASE #1: SOFT VALIDATION (NO DB INTERACTION YET)
  //           "Because you cannot trust Javascript validation"
  // **************************************************************
    
  // Validate user name
  var validatorLogin = Validators.login(login); // FIXME: If field is empty, this KILLS node
  if( ! validatorLogin.result ){
    errors.push( {field: 'login' , message: validatorLogin.message });
  }

  // There were errors: end of story, don't even bother the database
  if(errors.length){
    next( new g.errors.ValidationError422('Soft validation of parameters failed', errors));
    return;
  }
    
  // *******************************************************
  // PHASE #2: POST THE DATA
  // Note: since we are posting username/password,
  // 
  // *******************************************************

  User.findOne( { login: login}, function(err, docs){
    // Log database error if it's there
    if(err ){
      next(new g.errors.BadError503("Database error fetching user") );
    } else {
      // If the user exists, add it to the error vector BUT keep going
      if(! docs || docs.password != req.body.password){
          errors.push({ field:'password', message: 'Password incorrect', mustChange: false } );
          next( new g.errors.ValidationError422('Soft validation of parameters failed', errors));
      } else {
        if( docs.password == req.body.password ) {
          errors.push({ field:'password', message: 'Password Match!', mustChange: false } );
          res.json( { response: 'OK' } , 200);
          req.session.loggedIn = true;
          req.session.login = req.body.login;
        }
      }
    }
  }); // User.findOne()


  //
  } , 500); // Artificial timeout
  //

}

exports.postLogout = function(req, res, next){

  // *****
  setTimeout(function(){
  // *****

    // There is nothing to be checked: simply logs out by clearing the session variables
    req.session.loggedIn = false;
    req.session.login = null;

    // Send an OK response. It's up to the client to redirect/etc.
    res.json( { response: 'OK' } , 200);

  //
  } , 500); // Artificial timeout
  //

}



