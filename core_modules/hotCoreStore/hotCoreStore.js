"use strict";

var dummy
  , hotplate =  require('hotplate')
  , declare = require( 'simpledeclare' )
  , SimpleDbLayer = require( 'simpledblayer' )
  , SimpleSchema = require( 'simpleschema' )
  , JsonRestStores = require( 'jsonreststores' )
  , async = require( 'async')
;

var registry = exports.registry = {};

hotplate.config.set( 'hotCoreStore.storesUrlsPrefix', "/stores" );
hotplate.config.set( 'hotCoreStore.zapIndexes', false );


/* ******************************************************** */
/* The basic stores, ready-to-use with the selected DB etc. */
/* ******************************************************** */

exports.get = hotplate.cacheable( function( done ){

  // Simple schema
  var BasicSchema =  declare( [ SimpleSchema, hotplate.config.get( 'hotplate.SchemaMixin') ] );

  // Enhanced schema (legacy)
  var HotSchema = BasicSchema;

  // Sets the DB Layer
  var DbLayer = declare([ SimpleDbLayer, hotplate.config.get('hotplate.DbLayerMixin') ], {
    db: hotplate.config.get( 'hotplate.db' )
  });

    // Creates a basic DB store based on that layer
  var BasicDbStore = declare( [ JsonRestStores, JsonRestStores.SimpleDbLayerMixin, JsonRestStores.HTTPMixin ], {
    DbLayer: DbLayer,
    chainErrors: 'all'
  });

  // Creates a basic DB store based on that layer
  var HotStore = declare( [ BasicDbStore ], { enableComet: true } );

  done( null, { BasicSchema: BasicSchema, HotSchema: HotSchema, BasicDbStore: BasicDbStore, HotStore: HotStore } );

} );

/* ******************************************************** */
/*                  Permission mixins                       */
/* ******************************************************** */

/* To WRITE (put, post, delete), userId needs to match logged in user */
exports.BasicPermissionsMixin = declare( Object, {

  _checkUserId: function( request, cb ){

    var self = this;

    // User is not logged in: fail
    if( ! request.session.userId || ! request.session.loggedIn) return cb( new self.UnauthorizedError() );

    // The request doesn't include a userId: pass it through (nothing to compare against)
    if( ! request.params.userId ) return cb( null, true );

    // userId is different to session's: fail
    if( request.params.userId.toString() !== request.session.userId.toString() ){
      return cb( null, false );
    }

    // Any other cases: pass
    cb( null, true );
  },

  checkPermissions: function f( request, method, cb ){
    var self = this;

    this.inheritedAsync( f, arguments, function( err, res ){
      if( err ) return cb( err );
      if( ! res ) return cb( null, false );

      // getXXX methods are not handled
      if( method === 'get' || method === 'getQuery' ) return cb( null, true );

      self._checkUserId( request, cb );
    });
  },

});

/* To READ (get, getQuery), userId needs to match logged in user */
exports.PrivateUserDataPermissionsMixin = declare( Object, {

  _checkUserIdForJsonRestStores: function( request, cb ){
    var self = this;

    // User is not logged in: fail
    if( ! request.session.userId ) return cb( new self.UnauthorizedError() );

    // The request doesn't include a userId: pass it through (nothing to compare against)
    if( ! request.params.userId ) return cb( null, true );

    // userId is different to session's: fail
    if( request.params.userId.toString() !== request.session.userId.toString() ){
      return cb( null, false );
    }

    // Any other cases: pass
    cb( null, true );

  },

  checkPermissions: function f( request, method, cb ){
    var self = this;

    this.inheritedAsync( f, arguments, function( err, res ){
      if( err ) return cb( err );
      if( ! res ) return cb( null, false );

      // Only getXXX methods are handled
      if( method !== 'get' && method !== 'getQuery' ) return cb( null, true );

      self._checkUserIdForJsonRestStores( request, cb );

    });
  },

});


/* ******************************************************** */
/*                  Registry                                */
/* ******************************************************** */

exports.getAllStores = hotplate.cacheable( function( done ){

  hotplate.hotEvents.emitCollect( 'stores', function( err, results){

    results.forEach( function( element ) {

      Object.keys( element.result ).forEach( function( k ){

       var store = element.result[ k ];

       // Add the module to the store registry
       registry[ store.storeName ] = store;

      });

    });
    done( null, registry );
  });

});


/* ******************************************************** */
/*   Store exposer -- run protocolListenHTTP for every      */
/*                    store marked as `hotExpose`
/* ******************************************************** */
hotplate.hotEvents.onCollect( 'setRoutes', function( app, done ){

  exports.getAllStores( function( err, allStores ){

    Object.keys( allStores ).forEach( function( storeName ){

      var store = allStores[ storeName ];

      // The store has a public URL: add it to the list of stores to expose
      // Note that I pass the modified URL to setAllRoutes
      if( store.hotExpose ){
        store.publicURLPrefix = hotplate.config.get( 'hotCoreStore.storesUrlsPrefix' );
        store.protocolListenHTTP( { app: app } );
      }
    });

    done( null );
  });
});


/* ******************************************************** */
/*   Store index creator                                    */
/* ******************************************************** */

exports.regenerateAllIndexes = function( done ){

  exports.getAllStores( function( err, allStores ){

    Object.keys( allStores ).forEach( function( storeName ){

      var store = allStores[ storeName ];

      if( ! store.dbLayer ) return; // Like saying "continue"

      store.dbLayer.dropAllIndexes( function( e ){
        store.dbLayer.generateSchemaIndexes( { background: true }, function(){}  );
      });
    });

    done( null );
  });
}


hotplate.hotEvents.onCollect( 'run', function( done ){
  if( ! hotplate.config.get( 'hotCoreStore.zapIndexes' ) ) return done( null );

  exports.regenerateAllIndexes( done );
});
