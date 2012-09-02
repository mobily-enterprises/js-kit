
var util = require('util'),
fs = require('fs'),
utils = require('./utils.js');


exports.loader = function(app){

  // Variables global at module level
  exports.app = app;
  exports.loaded = {};

  fs.readdirSync('./modules').forEach( function(moduleDir) {
    console.log("Attempting to load module " + moduleDir);
    moduleFile = './modules/' + moduleDir + '/main.js';
    if( fs.existsSync( moduleFile ) ){
      r = require( moduleFile ) ;
      exports.loaded[moduleDir] = { path: moduleDir, file: moduleFile, module: r };
    } else {
      console.log("!! There was a problem loading " + moduleFile);
    }

    // Initialise loaded modules
    for( var keys in exports.loaded) {
      moduleEntry = exports.loaded[keys];
      if( moduleEntry.module.init ) {
        moduleEntry.module.init();
      }
    };

  });
}

