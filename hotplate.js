
var dummy
, async = require('async')
, EventEmitterCollector = require("eventemittercollector")
, DeepObject = require("deepobject")
, logger = require('tracer').console()
;

var hotplate = exports;

hotplate.require = function( m ){ return require( m ); }
hotplate.cachable = async.memoize;
hotplate.hotEvents = new EventEmitterCollector();
hotplate.config = new DeepObject();

// Sane hotplate-wide defaults
// You can and should) over-ride them in your server.js file
hotplate.config.set( 'hotplate.staticUrlPath', '/hotplate' ); // REMEMBER '/' at the beginning
hotplate.config.set( 'hotplate.logToScreen', 'true' );
hotplate.config.set( 'hotplate.db', null );

hotplate.log = function(){
  if( hotplate.config.get('logToScreen') ){
    logger.log.apply( this, arguments );
  }
}

var origEmit = hotplate.hotEvents.emit;
hotplate.hotEvents.emit = function(){
  hotplate.log("Emitted event: " + arguments[0] );
  origEmit.apply( this, arguments );
}
