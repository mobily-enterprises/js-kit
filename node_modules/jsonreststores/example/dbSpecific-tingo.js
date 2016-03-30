
    // Generic modules
    var declare = require('simpledeclare'); // Declare module
    var JsonRestStores = require('jsonreststores'); // The main JsonRestStores module
    var SimpleSchema = require('simpleschema');  // The main schema module
    var SimpleDbLayer = require('simpledblayer'); // The main DB layer module

    // Tingo-specific modules
    var tingo = require("tingodb")({}); // TingoDB
    var SimpleSchemaTingo = require('simpleschema-tingo'); // Tingo-specific functions for the schema module
    var SimpleDbLayerTingo = require('simpledblayer-tingo'); // Tingo-specific functions for the DB layer
    
    exports.db = null
    exports.DbLayer = null;
    exports.Schema = null;
    exports.JRS = null;

    exports.connect = function( url, options, cb ){
      try {
        exports.db = new tingo.Db(url, options );
      } catch( e ){
        return cb( e );
      }
      exports.Schema = declare( [ SimpleSchema, SimpleSchemaTingo ] );
      exports.DbLayer = declare( [ SimpleDbLayer, SimpleDbLayerTingo ], { db: exports.db } );
      exports.JRS = declare( JsonRestStores, { DbLayer: exports.DbLayer } );

      cb( null );
    }    

