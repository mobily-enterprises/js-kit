var async = require('async')
  , EventEmitterCollector = require("eventemittercollector")
  , DeepObject = require("deepobject")
  , colorConsole = require('tracer').colorConsole()
  , path = require( 'path')
  ;
var hotplate = exports;

// Hotplate's core functionality
hotplate.cacheable = async.memoize;
hotplate.hotEvents = new EventEmitterCollector();
hotplate.config = new DeepObject();
hotplate.critical = colorConsole.error.bind( colorConsole );
hotplate.prefix = function( p ){
  return path.join( hotplate.config.get( 'hotplate.routeUrlsPrefix' ), p );
};

// Hotplate's sane defaults
// You can (and should) over-ride them in your server.js file

// Basic Hotplate prefixes for locations
hotplate.config.set( 'hotplate.moduleFilesPrefix', '/hotplate' ); // hotClientXXX modules will use it as base URL
hotplate.config.set( 'hotplate.routeUrlsPrefix', '/pages' ); // hotCoreAuth uses it as base URL

// Db settings
hotplate.config.set( 'hotplate.db', null );
hotplate.config.set( 'hotplate.DbLayerMixin', function(){ } );
hotplate.config.set( 'hotplate.SchemaMixin', function(){ } );
