
var hotplate = require('hotplate');

exports.errors = require('./errors.js');
exports.AppErrorHandler = require('./AppErrorHandler.js');

// Add the error handler to the app object
exports.init = function(){
   hotplate.app.use(exports.AppErrorHandler)
}

