
var util = require('util'),
fs = require('fs'),
utils = require('../../utils.js'),
modules = require('../../modules.js'),
routesAnon = require('./routesAnon'),
routesUser = require('./routesUser');


exports.init = function(){
 
  var app = modules.app;

  /* 
   ****************************************************************
   * DATA AJAX CALLS -- ANONYMOUS
   ****************************************************************
  */

  app.post('/anon/recoverAnon',    routesAnon.postRecoverAnon );   // NONDATA
  app.post('/anon/loginAnon',      routesAnon.postLoginAnon);      // NONDATA
  app.get( '/anon/workspacesAnon', routesAnon.getWorkspacesAnon );
  app.get( '/anon/usersAnon'     , routesAnon.getUsersAnon );
  app.post('/anon/workspacesAnon', routesAnon.postWorkspacesAnon );

  /* 
   ****************************************************************
   * DATA AJAX CALLS -- USERS
   ****************************************************************
  */

  app.post('/user/workspacesUser', routesUser.postWorkspacesUser);
  app.post('/user/logoutUser',     routesUser.postLogoutUser);   // NONDATA


  

}


