/*
 * Module dependencies.
 */

var dummy
, async = require('async')
, declare = require("simpledeclare")
;


// Create the enhanced EventEmitter
var EventEmitterCollector = exports = module.exports = declare( Object, {

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

/*
    // Don't remember why I added this, and doesn't even really work, will
    // uncomment/delete this function when it comes to me
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
*/

    return a;

  },

  constructor: function(){
    this.listenersByModuleEvent = {}
    this.listenersByEvent = {}
  },


  addListenerCollect: function(){
    this.onCollect.apply( this, arguments );
  },
 
  // add a callback for a specific event/module pair. If module is missing,
  // it will default to "global"
  onCollect: function( event, module, listener ){

    // console.log("ADDING:");
    // console.log( event );
    // console.log( module );
    // console.log( listener );

    // The `module` parameter is optional
    if( typeof( module ) === 'function' ){
      listener = module;
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
  },

  emitCollectModule: function(){

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
              done( null, { module: module, result: res } );
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

  emitCollect: function(){

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
  },
})

