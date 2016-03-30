
    // Generic modules
    var declare = require('simpledeclare'); // Declare module
    var JsonRestStores = require('jsonreststores'); // The main JsonRestStores module
    var SimpleSchema = require('simpleschema');  // The main schema module
    var SimpleDbLayer = require('simpledblayer'); // The main DB layer module

    // Mongo-specific modules
    var mongo = require("mongodb"); // MongoDB
    var SimpleSchemaMongo = require('simpleschema-mongo'); // Mongo-specific functions for the schema module
    var SimpleDbLayerMongo = require('simpledblayer-mongo'); // Mongo-specific functions for the DB layer
    
    exports.db = null
    exports.DbLayer = null;
    exports.Schema = null;
    exports.JRS = null;

    exports.connect = function( url, options, cb ){
      mongo.MongoClient.connect( url, options, function( err, db ){
        if( err ){
          cb( err );
        } else {
          exports.db = db;
          exports.Schema = declare( [ SimpleSchema, SimpleSchemaMongo ] );
          exports.DbLayer = declare( [ SimpleDbLayer, SimpleDbLayerMongo ], { db: db } );
          exports.JRS = declare( JsonRestStores, { DbLayer: exports.DbLayer } );

          cb( null );
        }
      });
    }    

