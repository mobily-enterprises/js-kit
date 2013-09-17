
/*!
 * Module dependencies.
 */

var util = require('util')
, fs = require('fs')
, path = require('path')
, express = require('express')
, async = require('async')
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

  // Set some sane defaults
  this.options = {};
  this.options.staticUrlPath = '/hotplate'; // REMEMBER '/' at the beginning
  this.options.errorPage = function(req, res, next){ res.send( "ERROR: " ); } //  + req.application.error.message ); }
  this.options.logToScreen = true;

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

  // It's a set -- Set the relevant key
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

Hotplate.prototype.getModule = function( moduleName ){

  if( typeof(this.modules[moduleName]) === 'undefined' ){
    hotplate.log("===== WARNING! getModule was asked for %s, which is not loaded", moduleName);
  }
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
 * The exports of the hotplate module is an instance of this class.
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
 * has functions to add routes, which need the 'app' object
 * 
 * @param {Express} The express object used in the application
 * 
 * @api public
 */


Hotplate.prototype.setApp = function(app){
  this.app = app;
}


/**
 * Hotplate-wide Log function
 *
 * The parameter "logToScreen" will define whether it will actually print things or not
 * 
 * @param {message} The message to print out
 * 
 * @api public
 */


Hotplate.prototype.log = function(){
  if( hotplate.get('logToScreen') ){
    console.log.apply(this, arguments);
  }
}


/**
 * Load all modules that are marked as "enabled"
 *
 * This function will require and register all modules in modulesFullPath
 * that satisfy the `filter` regexp.
 * 
 * modulesFullPath is actually optional: when not there, it defaults
 * to the node_modules directory belonging to the current instante of Hotplate
 * 
 * @param {filter} The regexp which will filter the modules to load
 * @param {modulesFullPath} (optional) The full path of the modules to load
 * 
 * @api public
 */

Hotplate.prototype.registerAllEnabledModules = function( filter, modulesFullPath ) {

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
  this.modules[ 'hotplate' ] = this;

}

/**
 * Register a module
 *
 * Register  a module into Hotplate's module registry.
 * 
 * @param {String} The module's name
 * @param {Object} The module to register
 * 
 * @api public
 */

Hotplate.prototype.registerModule = function( moduleName, m ){
  this.modules[ moduleName ] = m ;
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

Hotplate.prototype.runModules = function( callback ){

  // Invoke "run" in all modules (run MUST be order-agnostic)
  this.invokeAll('run', callback );

}

Hotplate.prototype.initModules = function( callback ){

  var that = this,
      fullList = [], 
      orderedList = [], 

      modules = this.modules,
      initStatus = {},
      functionList = [];


  // Can't do this twice
  if( this.modulesAreInitialised ) return;
  this.modulesAreInitialised = true;

  // Make up the initial list of modules to initialise
  for( var m in modules ){
    if (typeof( modules[ m ].hotHooks) === 'object' && typeof( modules[ m ].hotHooks.init ) == 'function' ){
      hotplate.log( "Adding %s to the full list of modules to initialise", m );
      fullList.push( m );
      initStatus[ m ] = 'NOT_ADDED'; // Initial status
    } else {
      hotplate.log( "Skipping %s as it does not have an init() method, skipping", m );
    }
  };
     
  hotplate.log( "FULL LIST OF MODULES TO INITIALISE IS: %s", fullList );

  // Set the default initStatus for all the modules to initialise
  fullList.forEach( function( item ) {
    initStatus[ m ] = "NOT_ADDED";
  });

 
  // Let the recursive dance begin... This will end up setting the orderedList variable,
  // which will contain the modules in the right init order depending on dependencies
  addModules(fullList, 2 );
  
  hotplate.log("ORDERED LIST: " + orderedList);  
 
  // Invokes init() for each module, in the right order!
  orderedList.forEach( function(moduleName){

     functionList.push( function(done){
       hotplate.log("Calling init call for module %s", moduleName);
       modules[ moduleName ].hotHooks.init.call( modules[ moduleName ], done );
     });

     // modules[ moduleName ].hotHooks.init.call( modules[ moduleName ] );
  });
 

  // THAT's IT!
  async.series( functionList, callback ); 


  // Quick indent function
  function i(spaces){
    var r = '';
    for( var i = 0; i <= spaces; i ++ ){
      r += ' ';
    }
    return r;
  }

  
  // Recoursive function that will load one module at a time,
  // checking for dependencies (and recursively loading them
  // if there need be)
  function addModules( list, indent ){

    var subList = {};
    var moduleName, kk;

    for( kk in list ) {
      moduleName = list[ kk ];

      hotplate.log( "\n" + i(indent) + "Adding %s", moduleName);

      // The module's init doesn't invokeAll(), all good: just initialise it
      // unless it has already been initialised
      
      if( typeof( modules[ moduleName ].hotHooks.init.invokes) == 'undefined' && typeof( modules[ moduleName ].hotHooks.init.after) == 'undefined' ){
        hotplate.log( i(indent) + "Module %s's init() doesn't invoke anything and doesn't have any `after` list, it can be added right away", moduleName );
        actuallyAdd( moduleName, indent );

      // This module's is already being initialised, do nothing!
      } else if( initStatus[ moduleName ] != 'NOT_ADDED' ) { 

        hotplate.log( i(indent) + "Module %s's not initialised as it's status is already %s, doing nothing", moduleName, initStatus[ moduleName ] );
  
      // This module's init DOES need care! Find out which modules provide the invokeAll required,
      // and load them first
      } else { 

        // The module is now formally being initialised
        initStatus[ moduleName ] = 'ADDING';

        // Reset the "subList" assoc array...
        // It's not a straight array so that it's easy to avoid reps
        subList = {};

        // First of all, check for the init.after array to see which modules should be
        // called first
        var after = modules[ moduleName ].hotHooks.init.after;
        if( Array.isArray( after ) ){
          hotplate.log( i(indent) + "Module %s has a init.after list, honouring it:", moduleName, after );
          for( var ii =0, ll = after.length; ii < ll; ii++ ){
            addToSubListIfNecessary( after[ ii ] );
          }
        }

        // Check the init.invokes array, which will contain a list of hooks: modules
        // providing those hooks will need to be initialised first 
        var invokeList = modules[ moduleName ].hotHooks.init.invokes;
        if( Array.isArray( invokeList )) {
          hotplate.log( i(indent) + "Module %s calls invokeAll(%s), checking which modules provide it, adding them first", moduleName, invokeList );
          // For each module in the invoke list, add it to the sub-list of modules to initialise
          invokeList.forEach( function(invokedFunction ){
            hotplate.log( i(indent) + "----Looking for modules that provide %s...", invokedFunction );
            for( var m in modules){
              if( typeof( modules[ m ].hotHooks) === 'object' && modules[ m ].hotHooks[ invokedFunction ] ){
                addToSubListIfNecessary( m );
              }
            }    
          });
        }

        // At this point, the variable subList has a list of modules
        // that will need to be loaded first

        // Init the sub-modules (if needed)
        hotplate.log( i(indent) + "LIST of dependencies for %s is: [%s]. Reiterating self if necessary (intending in)", moduleName, Object.keys(subList) );
        addModules( Object.keys( subList ), indent + 2 );

        hotplate.log( i(indent) + "THERE should be no un-init()ialised dependencies for %s at this stage" , moduleName);

        // At this point, this module is ready to be initialised.
        // Set its status to NOT_ADDED first, so that actuallyAdd actually adds it,
        // and that's it!
        initStatus[ moduleName ] = 'NOT_ADDED';
        actuallyAdd( moduleName, indent );
      }

    };
    
    function addToSubListIfNecessary( m ){
      hotplate.log( i(indent) + "Module %s first then, checking if it has an init() function...", m );
      if( typeof( modules[ m ].hotHooks.init ) == 'undefined' ){
         hotplate.log( i(indent) + "Module %s doesn't need to init(), ignoring...", m );
      } else {
        hotplate.log( i(indent) + "Module %s DOES need to init(), considering adding it to the list of modules to load", m );

        // The module has an init(), but it could be initialising as we speak...
        switch( initStatus[m]){
          case 'ADDING':
            // FIXME: Add warning about circular dependencies if the name if the module being initialised
            // is different to the one found in m. MAYBE.
            hotplate.log( i(indent) + "Module %s (for %s) in dependency list BUT it's being initialised as we speak, skipping..." , m, moduleName );
            // The only case when this is OK is when a module provide the hooks it needs the init() for (which might well happen). 
            // In any other case, it's the symptom of a circular dependency
            if( m != moduleName ){
              hotplate.log( i(indent) + "!!!!!!!!!!!! WARNING! It looks like you might be experiencing circular dependencies!" );
            }
          break;

          case 'ADDED':
            hotplate.log( i(indent) + "Skipping module %s as its status was already %s", m, initStatus[m] );
          break;

          case 'NOT_ADDED':
            hotplate.log( i(indent) + "ADDED!!! Adding module %s to the sublist, its status was %s", m, initStatus[m] );
            subList[ m ] = true;
         break;
        } // switch
      } // if( typeof( modules[ m ].hotHooks.init ) == 'undefined' )
    }


  }

  // Simple function to add a module to the list of the ones to initialise
  // It will only initialise it if the status is NOT_ADDED.
  // `indent` is ther only so that the output has the right indentation
  function actuallyAdd(moduleName, indent ){

    hotplate.log( i(indent) + "Called actuallyAdd() on %s", moduleName );
    hotplate.log( i(indent) + "initStatus on %s is: %s", moduleName, initStatus[moduleName] );
    if( initStatus[ moduleName ] == 'NOT_ADDED'  ){
      hotplate.log( i(indent) + "Initialising module %s, since it hadn't been initialised yet", moduleName );
      initStatus[ moduleName ] = 'ADDED';
      hotplate.log( i(indent) + "Module %s set as 'ADDED'", moduleName );
      orderedList.push(moduleName);
    } else {
      hotplate.log( i(indent) + "Module %s not initialised, as its status was %s, nothing to do!", moduleName, initStatus[ moduleName ]);
    }
  }

}

Hotplate.prototype.invokeAll = function( ){
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

  var modules = this.modules;
 
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


/*
// Obsolete, not used in the end. Seemed like a good idea at the time...
Hotplate.prototype.invokeAllFlattened = function( ){
  var hook,
  args,
  callback,
  toReturn = [];

  // "Steal" the final argument, replace it with a different callback
  args = Array.prototype.splice.call(arguments, 0);
  callback = args.pop();
  args.push( flatten );

  // Call invokeAll, with the new callback
  Hotplate.prototype.invokeAll.apply( this, args );

  // Callback that will flatten the results, and then call
  // the callback that was originally passed
  function flatten( err, results ){

    results.forEach( function( item ){
      item.forEach( function( item ){
        toReturn.push( item );
      })
    });

    // Call the original callback
    callback( null, toReturn );
  }
}
*/


// Undecided if this module itself should become a hook provider. Placing hooks here feels dirty
var hooks = Hotplate.prototype.hotHooks = {}



