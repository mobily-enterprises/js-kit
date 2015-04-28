var async = require('async')
  , EventEmitterCollector = require("eventemittercollector")
  , DeepObject = require("deepobject")
  , colorConsole = require('tracer').colorConsole()
  , debug = require('debug')('hotplate:hotplate')
  ;
var hotplate = exports;

// Hotplate's core functionality
hotplate.require = function( m ){ return require( m ); }
hotplate.cachable = async.memoize;
hotplate.hotEvents = new EventEmitterCollector();
hotplate.config = new DeepObject();
hotplate.critical = colorConsole.error.bind( colorConsole );

// Emit a debug line when emitting an event, using debug. Here for completeness
var origEmitCollect = hotplate.hotEvents.emitCollect;
hotplate.hotEvents.emitCollectCollect = function(){
  debug("Emitted event: %o", arguments );
  origEmitCollect.apply( this, arguments );
}
// Hotplate's sane defaults
// You can (and should) over-ride them in your server.js file
hotplate.config.set( 'hotplate.moduleFilesPrefix', '/hotplate' ); // hotClientXXX modules will use it as base URL
hotplate.config.set( 'hotplate.routeUrlsPrefix', '/pages' ); // hotCoreAuth uses it as base URL
// Db settings
hotplate.config.set( 'hotplate.db', null );
hotplate.config.set( 'hotplate.DbLayerMixin', function(){ } );
hotplate.config.set( 'hotplate.SchemaMixin', function(){ } );