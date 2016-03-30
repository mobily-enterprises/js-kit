var
  dummy

, declare = require('simpledeclare')

, J = require('./JsonRestStores.js')
, SM = require( './SimpleDbLayerMixin.js' )
, HM = require( './HTTPMixin.js' )
, SimpleDbLayer = require('simpledblayer')
, MongoMixin = require('simpledblayer-mongo')
, mongo = require('mongodb')
;


var allTests = require( "./test-all.js" );

// This function needs to return the DB layer connected to the mongo 

var tests = allTests.get(

  function getDbAndDbLayerAndJRS( done ) {

    mongo.MongoClient.connect( 'mongodb://localhost/tests', {}, function( err, db ){
  
    //mw.connect('mongodb://localhost/tests', {}, function( err, db ){
      if( err ){
        throw new Error("MongoDB connect: could not connect to database");
      } else {
        var DbLayer = declare( [ SimpleDbLayer, MongoMixin ], { db: db } );
        var JRS = declare( [J, SM, HM ], { DbLayer: DbLayer } );
        done( null, db, DbLayer, JRS );
      }
    });
  },

  function closeDb( db, done ) {
    db.close( done );
  }

);

for(var test in tests){
    exports[ test ] = tests[ test ];
}



