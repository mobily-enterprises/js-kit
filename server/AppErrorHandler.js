
/*
 * GET home page. Ths is a one page app, so there is not much
 * happening in terms of layout etc. I will serve the page as a
 * jade template though
 */
// http://ajax.googleapis.com/ajax/libs/dojo/1.7.2/dojo/dojo.js',data-dojo-config="async:true


var util = require('util'),
fs = require('fs');
Logger = require('./globals.js').Logger,

exports.AppErrorHandler = function( err, req, res, next){

  // Set the basic variables for logging. FIXME: to be completed
  var user = null;
  var workspace = null;   

  // Print out the stack in the standard output (for devel purposes)

	/* 
  console.error(err.name);
  console.error(err.httpError);
  */


  switch(err.name){

    // Validation error: like the others, but return the list of err.errors
    case 'ValidationError422':
      Logger(null, null, 3, 'Field validation error: ' + err.name + ', message: ' + err.message, req  );
      res.json(err.errors, err.httpError)
    break;

    // Common custom-made errors. They all do the same thing: return the error as err.message
    case 'BadError503':
    case 'ForbiddenError403':
    case 'NotFoundError404':
      Logger(null, null, 4, 'The application threw an error: ' + err.name + ', message: ' + err.message, req  );
      res.json( { message: err.message }, err.httpError );
    break;

    // Standard errors. These are given a higher loglevel
    default:
      Logger(null, null, 5, 'Unexpected error: ' + err.name + ', message: ' + err.message, req  );
      res.json( { message: err.message } , 500 );
    break;
  } 

}



