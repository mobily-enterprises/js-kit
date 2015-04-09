"use strict";

/*!
 * Module dependencies.
 */

var dummy
  , util = require('util')
  , hotplate = require('hotplate')
  , path = require('path')
;

exports.getAllSharedFunctions = hotplate.cachable( function( done ){
  
  var result = {};

  hotplate.hotEvents.emitCollect('sharedFunctions', function( err, sharedFunctions ) {
    if( err ) return done( err );

    // Gets the results, and adds them to the sharedValidators hash which
    // will then get used
    sharedFunctions.onlyResults().forEach( function( functions ){
      for( var k in functions ){
        result[ k ] = functions[ k ];
      }
    });

    done( null, result );
  });
});


// This is only cachable so that it cannot happen twice
hotplate.hotEvents.onCollect( 'setRoutes', hotplate.cachable( function( app, done ){

  // Defines the route [moduleFilesPrefix]/hotCoreSharedCode/shares.js which will
  // return the javascript which will define an object variable called
  // sharedFunctions containing all the defined validation functions
  // (divided by module)
  var sharedFunctionsLocation = path.join( hotplate.config.get('hotplate.moduleFilesPrefix'), 'hotCoreSharedCode', 'shared.js');


  hotplate.hotEvents.emitCollect( 'sharedFunctions', function( err, sharedFunctions ){
    if( err ){
      done( err );
    } else {

      app.get( sharedFunctionsLocation, function( req, res ){
        var result = '';

        // Define the variable as an associative array
        // WATCH OUT: needs to end with "\n " so that comma-clipping works even
        // if there is nothing in the rendered object
        result += "var sharedFunctions = { \n ";
    
        // Cycle through every module defined...
        sharedFunctions.forEach( function( item ){
          var moduleName = item.module;
          var sharedFunctions = item.result;

          // WATCH OUT: needs to end with "\n " so that comma-clipping works even
          // if there is nothing in the rendered object
          result += moduleName + ": {\n ";
          for( var functionName in sharedFunctions ){
            if( typeof( sharedFunctions[ functionName ] ) === 'function' ){
              result += functionName + ": " + sharedFunctions[ functionName ] + ",\n";
            }
          }
          // Clip the last comma and close the variable
          result = result.substring( 0, result.length -2 ) + "\n";
          result += "},\n";
        });

        // Clip the last comma and close the main associative array
        result = result.substring( 0, result.length -2 ) + "\n";
        result += "}\n";

        res.send( result );
      });

      done( null );
    }
  });

}))


// Make the file "shared.js" visible and shared.
hotplate.hotEvents.onCollect('pageElements', 'hotCoreSharedCode', function( done ){

  done( null, {
    jses: [ 'shared.js' ]
  });

});

