var async = require('async')
  , EventEmitterCollector = require("eventemittercollector")
  , DeepObject = require("deepobject")
  , tracer = require('tracer');

var hotplate = exports;

hotplate.require = function( m ){ return require( m ); }
hotplate.cachable = async.memoize;
hotplate.hotEvents = new EventEmitterCollector();
hotplate.config = new DeepObject();

// Sane hotplate-wide defaults
// You can (and should) over-ride them in your server.js file
hotplate.config.set( 'hotplate.moduleFilesPrefix', '/hotplate' ); // hotDojoAdd uses it as base URL
hotplate.config.set( 'hotplate.routeUrlsPrefix', '/pages' ); // hotCoreAuth uses it as base URL

// Db settings
hotplate.config.set( 'hotplate.db', null );
hotplate.config.set( 'hotplate.DbLayerMixin', function(){ } );
hotplate.config.set( 'hotplate.SchemaMixin', function(){ } );

// Logger, stolen from tracer.console()
var colorConsole = tracer.colorConsole({ transport: function( data ){ process.stderr.write( data.output + "\n" ); } } );
hotplate.logger = colorConsole;
hotplate.log = colorConsole.log; // Shorthand
hotplate.error = colorConsole.error; // Shorthand
hotplate.killLogging = function(){
  hotplate.log = hotplate.error = function(){};
  var F = function(){}; hotplate.logger = { warn: F, info: F, debug: F, trace: F };
}

var origEmit = hotplate.hotEvents.emit;
hotplate.hotEvents.emit = function(){
  hotplate.log("Emitted event: " + arguments[0] );
  origEmit.apply( this, arguments );
}
