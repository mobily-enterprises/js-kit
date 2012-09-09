
/*!
 * Module dependencies.
 */

var util = require('util')
, fs = require('fs')
, path = require('path')
, express = require('express')
, send = require('send')
;

/**
 * Hotplate constructor.
 *
 * The exports object of the `Hotplate` module is an instance of this class.
 * Most apps will only use this one instance.
 *
 * @api public
 */

function Hotplate() {

  this.options = {};
  this.options.staticUrlPath = '/hotplateDir'; // REMEMBER '/' at the beginning

  this.modules = {};
  this.app = {}; // A link to the express App, as submodules might need it

};


/**
 * Sets hotplate options
 *
 * ####Example:
 *
 *     hotplate.set('test', value) // sets the 'test' option to `value`
 *
 * @param {String} key
 * @param {String} value
 * @api public
 */
Hotplate.prototype.set = function (key, value) {
  if (arguments.length == 1)
    return this.options [ key];
  this.options [ key] = value;
  return this;
};


/**
 * Gets hotplate options
 *
 * ####Example:
 *
 *     hotplate.get('test') // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */

Hotplate.prototype.get = Hotplate.prototype.set;

Hotplate.prototype.getModule = function(moduleName){
  return this.modules[moduleName];
}



/**
 * The exports object is an instance of Hotplate.
 *
 * @api public
 */

module.exports = exports = new Hotplate;
var hotplate = module.exports;


/**
 * The Hotplate constructor
 *
 * The exports of the mongoose module is an instance of this class.
 *
 * ####Example:
 *
 *     var hotplate= require('hotplate');
 *     var hotplate2 = new hotplate.Hotplate();
 *
 * @api public
 */

hotplate.Hotplate = Hotplate;


/**
 * Set the "app" attribute of the hotplate object
 *
 * This is important as the hotplate object
 * has functions to add routes
 * 
 * @param {Express} The express object used in the application
 * 
 * @api public
 */


Hotplate.prototype.setApp = function(app){
  this.app = app;
}

/**
 * Load all modules that are marked as "enabled"
 *
 * This function will require all modules located in
 * `this.options.modulesLocalPath` (which defaults to
 * `modules/node_modules`). Once they are all loaded,
 * it will run the `module.init()` method for each one
 * (if present). Finally, it will process the page template
 * so that the page has all of the required css, js and variable
 * definitions there.
 * 
 * @param {Express} The express object used in the application
 * 
 * @api public
 */

Hotplate.prototype.registerAllEnabledModules = function(modulesLocalPath) {

  var that = this;

  // Can't do this twice
  if( this.modulesAreLoaded ) return;
  this.modulesAreLoaded = true;

  // Load the installed modules (if they are enabled)
  fs.readdirSync( path.join( __dirname, modulesLocalPath ) ).forEach( function( moduleName ) {
    if( moduleName == 'hotplate' ){
      console.log( "Skipping self stub..." );
    } else {
      var moduleFullPath = path.join( __dirname, modulesLocalPath,  moduleName );
      var moduleRelativePath = './' + path.join(  modulesLocalPath,  moduleName );

      var moduleEnabledLocation = path.join( moduleFullPath, 'enabled' );

      // If the module is enabled (it has a file called 'enabled'), load it
      if( fs.existsSync( moduleEnabledLocation ) ){
        console.log( "Registering module " + moduleName + ' from ' + moduleRelativePath );
        that.registerModule( moduleName, moduleRelativePath );
      } else {
        console.log( "Skipping " + moduleName + " as it's not enabled" );
      }
    }
  });
}

/**
 * Register a module
 *
 * Register  a module into Hotplate's module registry. Note that
 * the module will be require()d
 * 
 * @param {String} The module's path
 * @param {String} The module's client file location, defaults to 'client'
 * 
 * @api public
 */

Hotplate.prototype.registerModule = function(moduleName, moduleLocation){
  console.log("Registering " + moduleName + ' from location ' + moduleLocation );
  this.modules[ moduleName ] = require( moduleLocation );
}


/**
 * Invoke the "init" hook of all loaded module.
 *
 * This function must be called only when all modules are loaded and registered, and it
 * can only be called once. This is because all modules must expect every other module
 * to be loaded and answering hooks at this point.
 * 
 * @api public
 */

Hotplate.prototype.initModules = function(){

  // Can't do this twice
  if( this.modulesAreInitialised ) return;
  this.modulesAreInitialised = true;

  this.invokeAll('preInit');
  this.invokeAll('init');
  this.invokeAll('postInit');
}


Hotplate.prototype.invokeAll = function(){
  var hook, module, results = [];

  hook = arguments[0];
  for(var moduleName in this.modules){
    module = this.modules[moduleName];

    if( typeof( module.hotHooks ) === 'object' && typeof( module.hotHooks[hook] ) === 'function' ){
      console.log('Invoking ' + hook + ' in module ' + moduleName);
      
      results.push( { moduleName: moduleName, result: module.hotHooks[hook].apply( module, Array.prototype.splice.call(arguments, 1) ) } );
    }
  }
  return results;
}




