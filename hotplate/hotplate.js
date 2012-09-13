
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
  this.options.staticUrlPath = '/hotplate'; // REMEMBER '/' at the beginning

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
Hotplate.prototype.set = function( key, value ) {

  // It's a get
  if (arguments.length == 1) return this.options[ key ];


  // It's a set

  // First of all check that `key` isn't `staticUrlPath`. If it is,
  // concat "hotplate" at the end (it's mandatory)
  if( key == 'staticUrlPath' ){
    value = path.join( value, 'hotplate' );
  }

  // Set the relevant key
  this.options[ key ] = value;


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



Hotplate.prototype.registerCoreModules = function() {
  this.registerAllEnabledModules('node_modules/core/node_modules');
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
  //if( this.modulesAreLoaded ) return;
  //this.modulesAreLoaded = true;

  // Load the installed modules (if they are enabled)
  fs.readdirSync( path.join( __dirname, modulesLocalPath ) ).forEach( function( moduleName ) {
    if( moduleName == 'hotplate' ){
      console.log( "Skipping self stub..." );
    } else if( moduleName == 'core' ){
      console.log( "Skipping 'core'..." );
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

  var that = this,
      fullList = [], 

      modules = this.modules, // Object global to the recursive functions, for list of modules
      loadStatus = {};        // Object global to the recursive functions, to set a module's status

  // Can't do this twice
  if( this.modulesAreInitialised ) return;
  this.modulesAreInitialised = true;

  // Make up the initial list of modules to initialise
  for( var m in modules ){
    if( typeof( modules[ m ].hotHooks.init ) == 'function' ){
      console.log( "Adding %s to the full list of modules to initialise", m );
      fullList.push( m );
      loadStatus[m] = 'NOT_INITIALISED';
    } else {
      console.log( "Skipping %s as it does not have an init() method, skipping", m );
    }
  };
     

  // Let the recursive dance begin...  
  initModules(fullList, 2 );

  // Quick indent function
  function i(spaces){
    var r = '';
    for( var i = 0; i <= spaces; i ++ ){
      r += ' ';
    }
    return r;
  }

  // Simple function to initialise a module.
  // It will only initialise it if the status is NOT_INITIALISED.
  // `indent` is ther only so that the output has the right indentation
  function initialise(moduleName, indent ){

    console.log( i(indent) + "Called initialise() on %s", moduleName );
    if( loadStatus[ moduleName ] == 'NOT_INITIALISED'  ){
      console.log( i(indent) + "Initialising module %s, since it hadn't been initialised yet", moduleName );
      modules[ moduleName ].hotHooks.init.call( modules[ moduleName ] );
      loadStatus[ moduleName ] = 'INITIALISED';
    } else {
      console.log( i(indent) + "Module %s not initialised, as its status was %s, nothing to do!", moduleName, loadStatus[ moduleName ]);
    }
  }


  // Recoursive function that will load one module at a time,
  // checking for dependencies (and recursively loading them
  // if there need be)
  function initModules( list, indent ){

    var invokeList, subList = {};

    list.forEach( function(moduleName){
      console.log( "\n" + i(indent) + "Initialising %s", moduleName);

      // The module's init doesn't invokeAll(), all good: just initialise it
      // unless it has already been initialised
      if( typeof( modules[ moduleName ].hotHooks.init.invokes) == 'undefined' ){
        console.log( i(indent) + "Module %s's init() doesn't invoke anything, it can be init()ialised right away", moduleName );
        initialise( moduleName, indent );

      // This module's init DOES invokeAll()! Find out which modules provide the invokeAll required,
      // and load them first
      } else { 

        // The module is now formally being initialised
        loadStatus[ moduleName ] = 'INITIALISING';

        // Reset the "subList" array...
        subList = {};

        // Get an array with the invoke list (hooks from other modules that WILL get called)
        invokeList = modules[ moduleName ].hotHooks.init.invokes;
        console.log( i(indent) + "Module %s calls invokeAll(%s), checking which modules provide it, initialising them first", moduleName, invokeList );

        // For each module in the invoke list, add it to the sub-list of modules to initialise
        invokeList.forEach( function(invokedFunction ){
          console.log( i(indent) + "----Looking for modules that provide %s...", invokedFunction );
          for( var m in modules){

            if( modules[ m ].hotHooks[ invokedFunction ] ){
              console.log( i(indent) + "Module %s provides the hook, checking if it has an init() function...", m );
             
              if( typeof( modules[ m ].hotHooks.init ) == 'undefined' ){
                console.log( i(indent) + "Module %s doesn't need to init(), ignoring...", m );
              } else {
                console.log( i(indent) + "Module %s DOES need to init(), adding to the sub list of modules to initialise first", m );
 
                // The module has an init(), but it could be initialising as we speak...
                if( loadStatus[ m ] == 'INITIALISING' ){
                  // FIXME: Add warning about circular dependencies if the name if the module being initialised
                  // is different to the one found in m. MAYBE.
                  console.log( i(indent) + "Module %s (for %s) in dependency list BUT it's being initialised as we speak, skipping..." , m, moduleName );
                  // The only case when this is OK is when a module provide the hooks it needs the init() for (which might well happen). 
                  // In any other case, it's the symptom of a circular dependency
                  if( m != moduleName ){
                  console.log( i(indent) + "!!! WARNING! It looks like you might be experiencing circular dependencies!" );
                  }
                // 
                } else {  
                  subList[ m ] = true;
                }
              }
            }
          }    
          // Init the sub-modules (if needed)

          console.log( i(indent) + "LIST of dependencies for %s is: [%s]. Reiterating self if necessary (intending in)", moduleName, Object.keys(subList) );
          initModules( Object.keys( subList ), indent + 2 );

          console.log( i(indent) + "THERE should be no un-init()ialised dependencies for %s at this stage" , moduleName);

          // At this point, this module is ready to be initialised. Set its status
          // to NOT_INITIALISED and then initialised it
          loadStatus[ moduleName ] = 'NOT_INITIALISED';
          initialise( moduleName, indent );
        });

      }
    });
    
  }
  
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




