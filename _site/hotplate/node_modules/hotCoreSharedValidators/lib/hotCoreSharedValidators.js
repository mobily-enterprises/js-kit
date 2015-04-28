"use strict";

/*!
 * Module dependencies.
 */

var dummy
  , util = require('util')
  , hotplate = require('hotplate')
  , path = require('path')
;


// This is only cachable so that it cannot happen twice
hotplate.hotEvents.onCollect( 'setRoutes', hotplate.cachable( function( app, done ){

  // Defines the route [moduleFilesPrefix]/hotCoreSharedCode/shares.js which will
  // return the javascript which will define an object variable called
  // sharedFunctions containing all the defined validation functions
  // (divided by module)
  var sharedFunctionsLocation = path.join( hotplate.config.get('hotplate.moduleFilesPrefix'), 'hotCoreSharedValidators', 'validators.js');


  hotplate.hotEvents.emitCollect( 'sharedFunctions', function( err, sharedFunctions ){
    if( err ){
      done( err );
    } else {

      app.get( sharedFunctionsLocation, function( req, res ){
        var result = '';
        var functions = {};

        // Define the variable as an associative array
        // WATCH OUT: needs to end with "\n " so that comma-clipping works even
        // if there is nothing in the rendered object
        result += "var sharedValidators = { \n ";
    
        // Cycle through every module defined, add it to the `functions` array
        sharedFunctions.forEach( function( item ){
          var moduleName = item.module;
          var sharedFunctions = item.result;

          // Fish for functions ending with 'Validator', which will be
          // assumed to be validators
          for( var functionName in sharedFunctions ){
            if( typeof( sharedFunctions[ functionName ] ) === 'function' ){

              // If the function name ends with 'Validator', then it's added to
              // the hash (but, the trailing 'Validator' is taken out)
              if( functionName.indexOf('Validator', functionName.length - 9 ) !== -1 ){
                var shortFunctionName = functionName.replace( /Validator$/, '' );
                functions[ shortFunctionName ] = sharedFunctions[ functionName ];
              }
            }
          }
        });

        // Add the found functions to the result. Note that in case of
        // a duplicate name, the one defined last will always "win"
        for( var functionName in functions ){
          result += functionName + ": " + functions[ functionName ] + ",\n";
        }

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
hotplate.hotEvents.onCollect('pageElements', 'hotCoreSharedValidators', function( done ){

  done( null, {
    jses: [ 'validators.js' ]
  });

});

