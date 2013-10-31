
/*
 * Module dependencies.
 */

var dummy
, async = require('async')
, EventEmitterCollector = require("eventemittercollector")
;


var hotplate = exports;


// Set basic options to start with
exports.options = {};
exports.options.staticUrlPath = '/hotplate'; // REMEMBER '/' at the beginning
exports.options.errorPage = function(req, res, next){ res.send( "ERROR: " ); } //  + req.application.error.message ); }
exports.options.logToScreen = true;

// Initialise app to an empty object
exports.app = {}; // A link to the express App, as submodules might need it

// Sets the module-wide `app` variable, used by a lot of modules
// to set routes etc.
exports.setApp = function(app){
  exports.app = app;
}


// Allows other modules to require hotplate-specific ones, located
// under hotplate's directory tree
exports.require = function( m ){
  return require( m );
}


// Set the module's `options` variable
exports.set = function( key, value ) {

  // It's a get
  if (arguments.length == 1) return exports.options[ key ];

  // It's a set -- Set the relevant key
  exports.options[ key ] = value;

  return this;
};

// Get the value of the options variable.
// Note that this is the same function as `set()`, which will
// check the signatures and will act as a `get()` or as a `set()`
// accordingly
exports.get = exports.set;




// Logs something to the screen if `logToScreen` is true
exports.log = function(){
  if( hotplate.get('logToScreen') ){
    console.log.apply(this, arguments);
  }
}


exports.cachable = async.memoize;
exports.hotEvents = new EventEmitterCollector();


