"use strict";

var dummy
  , hotplate = require('hotplate')

  , declare = require('simpledeclare')
  , hotCoreJsonRestStores = hotplate.require('hotCoreJsonRestStores')
  , debug = require('debug')('hotplate:hotCoreStoreLogger')
;


var stores = {};

hotplate.hotEvents.onCollect( 'stores', 'hotCoreStoreLogger', hotplate.cachable( function( done ){

  hotCoreJsonRestStores.get( function( err, s ){
    if( err ) return done( err );

    var BasicDbStore = s.BasicDbStore;
    var BasicSchema = s.BasicSchema;

    var Log = declare( [ BasicDbStore ], {
      schema: new BasicSchema({

        logLevel   : { type: 'number', required: true, default: 1 },
        error      : { type: 'serialize', required: false },
        errorName  : { type: 'string', required: false },
        errorMessage: { type: 'string', required: false },
        errorStack : { type: 'string', required: false },
        errors     : { type: 'serialize', required: false },
        message    : { type: 'string', required: false },
        data       : { type: 'serialize', required: false },
        loggedOn   : { type: 'date', required: true, default: function(){ return new Date() } },
        workspaceId: { type: 'id' },
        userId     : { type: 'id', required: false },
        system     : { type: 'boolean', required: true, defaule: false },
      }),  
      storeName:  'log',
      paramIds: [ 'id' ],
    });
    stores.log = new Log();

    done( null, stores );
  });

}));


hotplate.hotEvents.onCollect( 'log', 'hotCoreStoreLogger', function( entry, done ){

  debug("Logging: %j", entry );
  
  stores.log.dbLayer.insert( entry, function( err ){

    // If logging fails, will emit a hotplate.critical. This is because logging will
    // always happen in "silent" mode, without having a callback, and the error will probably
    // fall silent
    if( err ){
      hotplate.critical("Could not log entry. This did NOT end up in the log:");
      hotplate.critical( entry );
      hotplate.critical("Error:");
      hotplate.critical( err );
    }

    done( err );
  });

});

