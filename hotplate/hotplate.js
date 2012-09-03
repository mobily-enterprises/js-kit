
var util = require('util'),
fs = require('fs'),
path = require('path'),
express = require('express'),
send = require('send');


function Hotplate() {

  // Default options
  this.options = {};
  this.options.staticUrlPath = '/lib/dojo/hotplate';

  this.app = {};
  this.modules = {};
  this.csses = {};

  this.modulesDir    = 'modules/node_modules';
  this.modulesAreLoaded = false;
};



// get and set functions for the options
Hotplate.prototype.set = function (key, value) {
  if (arguments.length == 1)
    return this.options[key];
  this.options[key] = value;
  return this;
};
Hotplate.prototype.get = Hotplate.prototype.set;


// Exports will export an instance of the Hotplate
module.exports = exports = new Hotplate;

// Set hotplate for internal use only
var hotplate = module.exports;

// Make the constructor accessible
hotplate.Hotplate = Hotplate;


// Sets the app variable, for sub-modules to use and enjoy
// (A lot of the modules will need it to define routes etc.)
Hotplate.prototype.setApp = function(app){
  this.app = app;
}


Hotplate.prototype.loadModules = function(modulesDir){

  var that = this;

  // Can't do it twice
  if( this.modulesAreLoaded ) return;

  this.modulesAreLoaded = true;
  this.modulesDir = modulesDir || 'modules/node_modules';

  // Load the installed modules.
  fs.readdirSync( path.join(__dirname, this.modulesDir) ).forEach( function(moduleName) {
    if( moduleName == 'hotplate' ){
      console.log( "Skipping self stub..." );
    } else {
      modulePath = path.join(__dirname, modulesDir,  moduleName);
      moduleFile = path.join(modulePath, 'server/main.js');
      moduleEnabled = path.join(modulePath, 'enabled');

      // If the module is enabled (it has a file called 'enabled'), load it
      if( fs.existsSync( moduleEnabled ) ){
        console.log( "Loading module " + moduleName + '...' );
        if( fs.existsSync( moduleFile ) ){
          console.log("Module " + moduleName + " enabled WITH server-side stuff" );
          r = require( moduleFile ) ;
          that.modules[moduleName] = { path: moduleName, file: moduleFile, module: r };
        } else {
          console.log("Module " + moduleName + " didn't have any server-side stuff (no server/main.js)" );
          that.modules[moduleName] = { path: moduleName, file: moduleFile, module: {}  };
        }
      } else {
        console.log("Skipping " + moduleName + " as it's not enabled");
      }
    }

  });


  // Initialise loaded modules, calling their init() functions
  for( var keys in this.modules) {
    moduleEntry = this.modules[keys];
    if( moduleEntry.module.init ) {
      moduleEntry.module.init();
    }
  };

}


Hotplate.prototype.clientPages = function(options){
  that = this;

  options = options || {};

  var staticUrlRegExp = new RegExp('^' + this.options.staticUrlPath + '/(.*?)/(.*)');

  // root required
  if (!root) throw new Error('static() root path required');

  return function static(req, res, next) {

    // If there is a match...
    var  match = req.path.match( staticUrlRegExp );
    if( match && that.modules[ match[1] ] ){

        var localDir = path.join('hotplate' , that.modulesDir, match[1] , '/client/');

        function error(err) {
          if( 404 == err.status) return next();
          next(err);  
        }
        send(req, match[2] )
         .maxage(options.maxAge || 0)
         .root(localDir)
         .hidden(options.hidden)
         .on('error', error )
         .pipe(res);

    }
  }


};



