
var util = require('util'),
fs = require('fs'),
utils = require('../../utils.js'),
modules = require('../../modules.js');


exports.router = function(req, res, next){

  console.log("Command: " + req.moduleCommand );
  utils.sendResponse(res, { data: { res: 'all good' }  } ); // Just send OK

}

exports.init = function(){
 
  var app = modules.app;

  app.get(      '/api/1/:tokenCall/users', testApi1 );
  app.get( '/call/:workspaceIdCall/users', testApi1 );


}

function testApi1(req, res, next){
  utils.sendResponse(res);
}
