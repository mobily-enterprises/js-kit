
var fs = require('fs'),
    path = require('path'),
    hotplate = require('hotplate');


// This module should add "validators.js" as 

exports.init = function(){
}

// Set the Validators
eval(fs.readFileSync( path.join( __dirname, '../client' , 'validators.js')).toString());
exports.Validators = Validators;

