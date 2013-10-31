
/*
 * Module dependencies.
 */

var util = require('util')
, fs = require('fs')
, path = require('path')
, express = require('express')
, async = require('async')
, declare = require("simpledeclare")
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



// Create the enhanced EventEmitter
var AsyncCollectEvents = declare( null, {

  _enrichArray: function( a ){

    a.onlyResults = function(){
      var ret = [];
      this.forEach( function( i ){
        ret.push( i.result );
      });  
      return ret;      
    };

    a.groupByModule = function(){
      var ret = {};
      this.forEach( function( i ){
        if( !Array.isArray( ret[ i.module ] ) ) ret[ i.module ] = [];
        ret[ i.module ].push( i.result );
      });  
      return ret;
      
    };

    a.indexBy = function( attr ){
      var ret = {};
      var newItem;
      this.forEach( function( i ){
        if( typeof( i.result ) === 'object' && i.result !== null ){
          ret[ i.result[ attr ] ] = newItem = i.result;
          newItem.module = i.module;
        }
      });  
      return ret;
    };

    return a;

  },

  constructor: function(){
    this.listenersByModuleEvent = {}
    this.listenersByEvent = {}
  },

  on: function(){
    this.onAsync.apply( this, arguments );
  },

  addListener: function(){
    this.onAsync.apply( this, arguments );
  },

  // add a callback for a specific event/module pair. If module is missing,
  // it will default to "global"
  onAsync: function( event, module, listener ){

    console.log("ADDING:");
    console.log( event );
    console.log( module );
    console.log( listener );

    // The `module` parameter is optional
    if( typeof( module ) === 'function' ){
      cb = module;
      module = 'global';
    }
  
    // Normalise this.listenersByModuleEvent
    if( typeof( this.listenersByModuleEvent[ module ] ) === 'undefined' ){
      this.listenersByModuleEvent[ module ] = {};
    }
    if( !Array.isArray( this.listenersByModuleEvent[ module ][ event ] ) ){
      this.listenersByModuleEvent[ module ][ event ] = [];
    }

    // Normalise this.listenersByEvent
    if( !Array.isArray( this.listenersByEvent[ event ] ) ){
      this.listenersByEvent[ event ] = [];
    }

    this.listenersByModuleEvent[ module ][ event ].push( listener );
    this.listenersByEvent[ event ].push( { module: module, listener: listener } );

    console.log("\nAFTER ADD SUMMARY:");
    console.log("--------------------------");
    u = require('util');
    console.log( 'this.listenersByModuleEvent:');
    console.log( u.inspect( this.listenersByModuleEvent, { depth: 4 } ) );

    console.log( 'this.listenersByEvent:');
    console.log( u.inspect( this.listenersByEvent, { depth: 4 } ) );

    console.log("--------------------------");
  },

  emitModule: function(){
    this.emitModuleAsync.apply( this, arguments );
  },

  emitModuleAsync: function(){

    var event, module,
    functionList = [],
    args,
    callback,
    listeners,
    eventArguments;

    var self = this;

    // Turn `arguments` into a proper array
    args = Array.prototype.splice.call(arguments, 0);
     
    // get the `hook` and `hookArgument` variables 
    event = args.splice( 0, 1 )[ 0 ]; // The first parameter, always the hook's name
    module = args.splice( 0, 1 )[ 0 ]; // The second parameter, always the module's name
    eventArguments = args;           // The leftovers, the hook's parameters
    
    // If the last parameter is a function, it's assumed
    // to be the callback
    //if( typeof( eventArguments[ eventArguments.length - 1 ] ) === 'function' ){
      callback = eventArguments.pop();   // The last parameter, always the callback
    //}
    
    if(
      typeof( this.listenersByModuleEvent[ module ] ) === 'undefined' || 
      typeof( this.listenersByModuleEvent[ module ][ event ] ) === 'undefined'
    ){
      callback( null, self._enrichArray( [] ) );
    } else {

      listeners = this.listenersByModuleEvent[ module ][ event ];
   
      listeners.forEach( function( listener ) {

        // Pushes the async function to functionList. Note that the arguments passed to invokeAll are
        // bound to the function's scope
        functionList.push( function( done ){
 
          listener.apply( this, Array.prototype.concat( eventArguments, function( err, res ){
            if( err ) {
              done( err );
            } else {
              done( null, { module: module, result:  res } );
            }

          }));
        });
      });

      //callback ? async.series( functionList, callback ) : async.series( functionList );
      async.series( functionList, function( err, res ){
        if( err ){
          callback( err );
        } else {
          callback( null,  self._enrichArray( res ) );
        }
      });
    }
  },


  emit: function(){
    this.emitAsync.apply( this, arguments );
  },

  emitAsync: function(){

    var event,
    functionList = [],
    args,
    callback,
    listenerItems,
    eventArguments;

    var self = this;

    // Turn `arguments` into a proper array
    args = Array.prototype.splice.call(arguments, 0);
     
    // get the `hook` and `hookArgument` variables 
    event = args.splice( 0, 1 )[ 0 ]; // The first parameter, always the hook's name
    eventArguments = args;           // The leftovers, the hook's parameters
    
    // If the last parameter is a function, it's assumed
    // to be the callback
    //if( typeof( eventArguments[ eventArguments.length - 1 ] ) === 'function' ){
      callback = eventArguments.pop();   // The last parameter, always the callback
    //}
    
    if( typeof( this.listenersByEvent[ event ] ) === 'undefined' ){
      callback( null, self._enrichArray( [] ) );
    } else {

      listenerItems = this.listenersByEvent[ event ];
   
      listenerItems.forEach( function( listenerItem ) {

        // Pushes the async function to functionList. Note that the arguments passed to invokeAll are
        // bound to the function's scope
        functionList.push( function( done ){

          listenerItem.listener.apply( this, Array.prototype.concat( eventArguments, function( err, res ){
            if( err ) {
              done( err );
            } else {
              done( null, { module: listenerItem.module, result: res } );
            }

          }));
        });
      });

      //callback ? async.series( functionList, callback ) : async.series( functionList );
      async.series( functionList, function( err, res ){
        if( err ){
          callback( err );
        } else {
        
          callback( null,  self._enrichArray( res ) );
        }
      }); 
    }
  }

})



var as = exports.hotEvents = new AsyncCollectEvents();
exports.AsyncCollectEvents = AsyncCollectEvents();


/*
as.onAsync( 'event1', 'module1', function( done ){
  console.log("Called event 'event1' for module 'module1', arguments:");
  console.log( arguments );
  done( null, 'event1 module1 ONE' );
});

as.onAsync( 'event1', 'module1', function( done ){
  console.log("AGAIN Called event 'event1' for module 'module1', arguments:");
  console.log( arguments );
  done( null, 'event1 module1 TWO' );
});

as.onAsync( 'event2', 'module1', function( param1, param2, done ){
  console.log("Called event 'event1' for module 'module1', arguments:");
  console.log( arguments );
  done( null, 'event1 module1, PARAMS:' + param1 + ',' + param2 );
});

as.onAsync( 'event2', 'module1', function( param1, param2, done ){
  console.log("AGAIN Called event 'event1' for module 'module1', arguments:");
  console.log( arguments );
  done( null, 'AGAIN event1 module1, PARAMS:' + param1 + ',' + param2 );
});

as.onAsync( 'event1', 'module2', function( done ){
  console.log("Called event 'event1' for module 'module2' (TWO!), arguments:");
  console.log( arguments );
  done( null, 'event1 module2' );
});

as.emitAsync( 'event1', function( err, results ){
  console.log("------------------");
  console.log("RESULTS FOR event1:");
  console.log( results );
  console.log("------------------");
})

as.emitAsync( 'event1', function( err, results ){
  console.log("------------------");
  console.log("RESULTS FOR event1, narrowed to module1:");
  console.log("**************************************************************");
  console.log( results  );
  console.log( results.groupByModule()  );
  console.log( results.onlyResults()  );
  console.log("------------------");
})




as.emitAsync( 'event2', 'ONE', 'TWO', function( err, results ){
  console.log("------------------");
  console.log("RESULTS FOR event2:");
  console.log( results );
  console.log("------------------");
})

as.emitModuleAsync( 'event1', 'module1', function( err, results ){
  console.log("------------------");
  console.log("RESULTS FOR event1 for module1:");
  console.log( results );
  console.log("------------------");
})

*/

// Invoke a specific hook. The first parameter is always the hook's name,
// the last parameter is always a callback. In between, there can be
// zero or more parameters (which will be passed to the hook)



/* TO BE CHUCKED IN THE BIN */



/*
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

  hotplate.log("invokeAll(%s) called!" , hook);
  hotplate.log(args);
  hotplate.log(hook);
  hotplate.log(hookArguments);

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

*/



/*

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

*/


