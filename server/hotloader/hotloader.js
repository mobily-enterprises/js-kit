
var util = require('util'),
fs = require('fs'),
express = require('express'),
send = require('send');

exports.loader = function(app){

  // Variables global at module level
  exports.app = app;
  exports.loaded = {};

  // Load the installed modules.
  fs.readdirSync(__dirname + '/modules/node_modules').forEach( function(moduleDir) {
    if( moduleDir == 'hotloader' ){
      console.log( "Skipping self stub..." );
    } else {
      console.log( "Loading module " + moduleDir + '...' );
      moduleFile = __dirname + '/mmodules/node_modules/' + moduleDir + '/server/main.js';
      if( fs.existsSync( moduleFile ) ){
        r = require( moduleFile ) ;
        exports.loaded[moduleDir] = { path: moduleDir, file: moduleFile, module: r };
      } else {
        console.log("!! There was a problem loading " + moduleFile);
      }
   }

    // Open up the "share" directory for this module

  });

  app.use(staticModules() );

  // Initialise loaded modules, calling their init() functions
  for( var keys in exports.loaded) {
    moduleEntry = exports.loaded[keys];
    if( moduleEntry.module.init ) {
      moduleEntry.module.init();
    }
  };

}


function staticModules(moduleDir, options){
  options = options || {};

  // root required
  if (!root) throw new Error('static() root path required');

  // default redirect
  var redirect = false === options.redirect ? false : true;

  return function static(req, res, next) {

    function error(err) {
      if (404 == err.status) return next();
      next(err);
    }

    // If there is a match...
    match = req.path.match(/^\/publicModuleFiles\/(.*?)\/(.*)/)
    if( match && exports.loaded[ match[1] ] ){

        var localDir = 'modules/node_modules/' + match[1] + '/client/';

        send(req, match[2] )
         .maxage(options.maxAge || 0)
         .root(localDir)
         .hidden(options.hidden)
          .on('error', error)
         .pipe(res);

    }
  }


};



