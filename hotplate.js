
/*
 * Module dependencies.
 */

var util = require('util')
, fs = require('fs')
, path = require('path')
, express = require('express')
, async = require('async')
, events = require("events")
;


var hotplate = exports;


// Set basic options to start with
exports.options = {};
exports.options.staticUrlPath = '/hotplate'; // REMEMBER '/' at the beginning
exports.options.errorPage = function(req, res, next){ res.send( "ERROR: " ); } //  + req.application.error.message ); }
exports.options.logToScreen = true;

// Initialise the list of registered modules
exports.modules = {};

// Initialise app to an empty object
exports.app = {}; // A link to the express App, as submodules might need it


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


exports.require = function( m ){
  return require( m );
}


// Fetch a module
exports.getModule = function( moduleName ){

  if( typeof(exports.modules[moduleName]) === 'undefined' ){
    hotplate.log("===== WARNING! getModule was asked for %s, which is not loaded", moduleName);
  }
  return exports.modules[moduleName];
}

// Sets the module-wide `app` variable, used by a lot of modules
// to set routes etc.
exports.setApp = function(app){
  exports.app = app;
}


// Logs something to the screen if `logToScreen` is true
exports.log = function(){
  if( hotplate.get('logToScreen') ){
    console.log.apply(this, arguments);
  }
}


exports.cachable = async.memoize;


// Register all modules matching the regexp `filter`. You can also
// provide the module's full path (otherwise, Hotplate's node_modules directory
// is assumed)
exports.registerAllEnabledModules = function( filter, modulesFullPath ) {

  var self = this;

  // If modulesFullPath is empty, default to hotplate's default module location
  // (here __dirname will be hotplate's full path, to which we simply add 'node_modules')
  if( modulesFullPath == '' || ! modulesFullPath ){
     modulesFullPath = path.join( __dirname, 'node_modules' );
  }

  // Load the installed modules (if they are enabled)
  fs.readdirSync( modulesFullPath ).forEach( function( moduleName ) {

    if( !filter || moduleName.match( filter ) ){

      var moduleFullPath = path.join( modulesFullPath,  moduleName );
      var moduleEnabledLocation = path.join( moduleFullPath, 'enabled' );

        // If the module is enabled (it has a file called 'enabled'), load it
      if( fs.existsSync( moduleEnabledLocation ) ){
        hotplate.log( "Requiring and registering module " + moduleName + ' from ' + moduleFullPath );
        var m = require( moduleFullPath );
        self.registerModule( moduleName, m );
      } else {
        hotplate.log( "Skipping " + moduleName + " as it's not enabled" );
      }
    }
  });
  
  // Registering hotplage itself as hook provider
  exports.modules[ 'hotplate' ] = this;

}

// Register a specific module
exports.registerModule = function( moduleName, m ){
  exports.modules[ moduleName ] = m ;
}

// Call the `run()` hook for all modules
exports.runModules = function( callback ){

  // Invoke "run" in all modules (run MUST be order-agnostic)
  exports.invokeAll('run', callback );

}


// Create the enhanced EventEmitter
function AsyncEvents() {
    events.EventEmitter.call(this);
}
util.inherits(AsyncEvents, events.EventEmitter);

AsyncEvents.prototype.onAsync = function(){
  return this.on.apply( this, arguments );
}

AsyncEvents.prototype.emitAsync = function( ){

  var event,
  module,
  results = [],
  functionList = [],
  args,
  callback,
  eventArguments;


  // Turn `arguments` into a proper array
  args = Array.prototype.splice.call(arguments, 0);
 
  // get the `hook` and `hookArgument` variables 
  event = args.splice(0,1)[0]; // The first parameter, always the hook's name
  eventArguments = args;       // The leftovers, the hook's parameters

  // If the last parameter is a function, it's assumed
  // to be the callback
  if( typeof( eventArguments[ eventArguments.length-1 ] ) === 'function' ){
    callback = eventArguments.pop();   // The last parameter, always the callback
  }

  var listeners = this.listeners( event );
 
  listeners.forEach( function( listener ) {

      // Pushes the async function to functionList. Note that the arguments passed to invokeAll are
      // bound to the function's scope
      functionList.push( function( done ){

          listener.apply( this, Array.prototype.concat( eventArguments, done ) );
      } );
  });
  callback ? async.series( functionList, callback ) : async.series( functionList );
}

exports.asyncEvents = new AsyncEvents();
exports.AsyncEvents = AsyncEvents();



// Invoke a specific hook. The first parameter is always the hook's name,
// the last parameter is always a callback. In between, there can be
// zero or more parameters (which will be passed to the hook)

exports.invokeAll = function( ){
  var hook,
  module,
  results = [],
  functionList = [],
  args,
  callback,
  hookArguments;


  args = Array.prototype.splice.call(arguments, 0);
  
  hook = args.splice(0,1)[0]; // The first parameter, always the hook's name
  hookArguments = args;       // The leftovers, the hook's parameters

  // If the last parameter is a function, it's assumed
  // to be the callback
  if( typeof( hookArguments[ hookArguments.length-1 ] ) === 'function' ){
    callback = hookArguments.pop();   // The last parameter, always the callback
  }

  /*
  hotplate.log("invokeAll(%s) called!" , hook);
  hotplate.log(args);
  hotplate.log(hook);
  hotplate.log(hookArguments);
  */

  var modules = exports.modules;
 
  for(var moduleName in modules){
    // var module = modules[moduleName];

    if( typeof( modules[moduleName].hotHooks ) === 'object' && typeof( modules[moduleName].hotHooks[hook] ) === 'function' ){
 
      // Pushes the async function to functionList. Note that the arguments passed to invokeAll are
      // bound to the function's scope
      functionList.push( function(){
        var mn = moduleName;
        return function( done ) {
          hotplate.log("Running hook %j for %s", hook, mn);
          // if( typeof( hookArguments ) === 'undefined' ) hookArguments = [];
          modules[mn].hotHooks[hook].apply( modules[mn], Array.prototype.concat( hookArguments, done ) );
         }
      }() );
    }
  }
  callback ? async.series( functionList, callback ) : async.series( functionList );
}



