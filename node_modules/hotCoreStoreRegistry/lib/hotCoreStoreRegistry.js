"use strict";

/*!
 * Module dependencies.
 */

var dummy
  , hotplate = require('hotplate')
;

var registry = exports.registry = {};

exports.getAllStores = hotplate.cacheable( function( done ){
  
  hotplate.hotEvents.emitCollect( 'stores', function( err, results){

    results.forEach( function( element ) {

      Object.keys( element.result ).forEach( function( k ){

       var store = element.result[ k ];

       // Add the module to the store registry
       registry[ store.storeName ] = store;

      });
      
    });
    done( null, registry );
  });

});



