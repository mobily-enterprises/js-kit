
var 
  dummy
, hotplate =  require('hotplate')
, SimpleSchema = require('./SimpleSchema')
, declare = require('./declare')
, Store = require('./Store')
, e = require('./Errors')
, url = require('url')
, async = require('async')
, checkObjectId = require('mongoWrapper').checkObjectId
, ObjectId = require('mongoWrapper').ObjectId
;



var MongoStore = declare( Store,  {

  collectionName: null,

  extrapolateDoc: function( fullDoc ){
    var doc = {};
    for( var k in fullDoc ) doc[ k ] = fullDoc[ k ];
    return doc;
  },


  prepareBeforeSend: function( doc, cb ){
    cb( null, doc );
  },

  allDbFetch: function( reqParams, cb ){
    cb( null, doc );
  }, 

  getDbQuery: function( req, res, sortBy, ranges, filters ){
    res.json( 200, [] );
  },

  putDbInsert: function( req, doc, fullDoc, cb ){
    cb( null, doc );
  },

  putDbUpdate: function( req, doc, fullDoc, cb ){
    cb( null, doc );
  },

  postDbInsertNoId: function( req, cb ){
    cb( null, doc );
  },

  postDbAppend: function( req, cleanBody, doc, fullDoc, cb ){
    cb( null, doc );
  },

  deleteDbDo: function( id, cb ){
    cb( null );
  },

  // DB specific functuons to check if an ID is legal
  checkId: function( id ){ 
    return checkObjectId( id );
  },
});

exports = module.exports = MongoStore;
