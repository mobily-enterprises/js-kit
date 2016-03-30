/*
Copyright (C) 2013 Tony Mobily

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var 
  dummy
, util = require('util')
, http = require('http')
;

/* TODO: Read, and probably apply, this: 

//http://stackoverflow.com/questions/17530782/extending-javascript-errors-exceptions

function MyError(message) {
    var e = new Error(message);
    // ...apply your enhancements to `e`
    return e;
}

Or maybe re-enable the stacktrace that is now commented out

*/


var e = {};
exports = module.exports = e;

Object.keys( http.STATUS_CODES).forEach( function(httpError){

  var errorName;

  // Extrapolate the error message from the module
  var message = http.STATUS_CODES[ httpError ];

  // Work out the "machine's" error name ('Not found' => 'NotFoundError' )
  errorName = message.replace( /\b./g, function(a){ return a.toUpperCase(); }).replace( /[^a-zA-Z]/g, '') + 'Error';

  // console.log(' * [' + httpError + '] ' + '`'+errorName + "`: " + message );

  // Make up the constructur
  e[ errorName ] = function( parameter, constr ){

    // Add stack trace information to this error
    // Error.captureStackTrace(this, constr || this)
        
    // Make up the p object depending on the parameter
    // This ensures that you can use the shorthand version passing just a string
    var p;
    if( typeof( parameter ) === 'undefined' ){
      p = {}
    } else if( typeof( parameter) === 'string' ){
      p = { message: parameter };
    } else if( typeof( parameter)  === 'object' ){
      p = parameter;
    } else {
      throw( new Error("Parameter needs to be string or object to construct " + errorName ) );
    }

    // Initialised object according to what was passed
    for( var k in p ){
      this[ k ] = p[ k ];
    }
 
    // Sets the message: from the error's default, or from what the user passed
    // (User message has priority)
    if( typeof( p.message ) !== 'undefined' ){
      this.message = p.message;
    } else {
      this.message = message;
    }

    this.httpError = httpError;
    this.stack = (new Error()).stack;

  }

  util.inherits ( e[ errorName ], Error );
  e[ errorName ].prototype.name = errorName;

});

