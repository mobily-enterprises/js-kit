
var util = require('util'),
fs = require('fs'),
g = require('../globals.js'),
mongoose = require('mongoose');
eval(fs.readFileSync('../client/validators.js').toString()); // Creates "Validators




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
    next( new g.errors.ValidationError422('Soft validation of parameters failed', errors));
    return;
  }
    
  // *******************************************************
  // PHASE #2: POST THE DATA
  // Note: since we are posting username/password,
  // 
  // *******************************************************

  User.findOne( { login: req.body.login}, function(err, docs){
    // Log database error if it's there
    if(err ){
      next(new g.errors.BadError503("Database error fetching user") );
    } else {
      // If the user exists, add it to the error vector BUT keep going
      if(! docs || docs.password != req.body.password){
          errors.push({ field:'password', message: 'Password incorrect', mustChange: true } );
          errors.push({ field:'', message: 'Login failed' });
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
    // NOTE: req.session.login is properly set to null as the user really wanted to login
    req.session.loggedIn = false;
    req.session.login = null;

    // Send an OK response. It's up to the client to redirect/etc.
    res.json( { response: 'OK' } , 200);

  //
  } , 500); // Artificial timeout
  //

}

