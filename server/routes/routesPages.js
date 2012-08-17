
var util = require('util'),
fs = require('fs'),
g = require('../globals.js'),
mongoose = require('mongoose');
eval(fs.readFileSync('../client/validators.js').toString()); // Creates "Validators

// ******************************
// The four pages in the whole
// application
// ******************************


exports.app = function(req, res){

  // If the user is not logged in, the page won't load at all, it will
  // redirect to login page
  if(! req.session.loggedIn ){
    res.redirect('/login');
    return; 
  }
  res.render('index',  { layout:false, login: req.session.login  } );
};

exports.login = function(req, res){
  res.render('login',  { layout:false, login: req.session.login } );
};

exports.recover = function(req, res){
  res.render('recover',  { layout:false, login: req.session.login } );
};

exports.register = function(req, res){
  res.render('register',  { layout:false, login: req.session.login } );
};


