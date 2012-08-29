
var utils = require('../utils.js'),
fs = require('fs'),
g = require('../globals.js'),
mongoose = require('mongoose');
eval(fs.readFileSync('../client/validators.js').toString()); // Creates "Validators




exports.postUsersApi1 = function(req, res, next){
  
  var Workspace = mongoose.model('Workspace');
  next( new g.errors.ForbiddenError403() );
   
  // res.json( [{name:'ppp'}] );
}
