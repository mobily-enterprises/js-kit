
var 
  dummy
, hotplate =  require('hotplate')
, url = require('url')
, async = require('async')
, checkObjectId = require('mongowrapper').checkObjectId
, ObjectId = require('mongowrapper').ObjectId
;


exports.hotHooks = hooks = {}

hooks.init = function( done ){
  done( null );
}



var MongoStores2 = function( options ){
  var i;

  // Mixin the options en masse
  for( var i in options ) this[i] = options[i];

  // Sets collectionObject based on the `collection` parameter
  this.collectionObject = db.collection( options.collection );  

  // This.storeName will default to the collection's name if not set
  this.storeName = typeof( this.storeName ) === 'undefined' ? this.collection : this.storeName;
}


MongoStores2.prototype.e = hotplate.getModule('hotError').errors;

MongoStores2.prototype.findOne = function( req, next,   cb ) {
  if( this.paramsIds.length === 1 ) {
    this.collectionObject.findOne( {_id: ObjectId( req.params[this.paramsIds[0]] ) }, cb );
  } else {
    cb( new Error("findOne needs to be defined manually when paramsIds > 1") );
  }
}




MongoStores2.prototype.setUpdateObject = function( req, next, cleanBody, cb ){

  var updateObject = {}, i;
  var updateObjectPrefix

  // Set updatePrefix to either its `this` counterpart ot to ''
  updateObjectPrefix = typeof( this.updateObjectPrefix ) === 'undefined' ? '' : this.updateObjectPrefix;

  // Simply copy values over from `req.body`
  for( i in cleanBody ){
      updateObject[ updateObjectPrefix + i ] = cleanBody[ i ];
  }
  // Sets `this.updateObject`
  this.updateObject = { $set: updateObject }    
  cb();
}


MongoStores2.prototype.setBroadcastObject = function( req, next, cb ){
  this.broadcastObject = this.docSection;
  cb();
}

MongoStores2.prototype.setDocSection = function( req, next, cb ){
  this.docSection = this.fetchedDoc;
  cb();
}

MongoStores2.prototype.checkPermissionsGet = function( req, next, cb ){
  cb();
}
MongoStores2.prototype.checkPermissionsPut = function( req, next, cb ){
  cb();
}

MongoStores2.prototype.prepareDocSectionBeforeSend = function( req, next, cb ){
  cb();
}

MongoStores2.prototype.findAndModify = function( req, next,  cb ){
  var findAndModifySelector;

  // Works out findAndModifySelector, by either getting it from the options, or trying to make one up
  if( this.findAndModifySelector ){
     findAndModifySelector = this.findAndModifySelector;
  } else {
    if( this.paramsIds.length === 1 ) {
      findAndModifySelector = { _id: ObjectId( req.params[this.paramsIds[0]]) };
    } else {
      cb( new Error("findAndModify OR findAndModifySelector need to be defined manually when paramsIds > 1") );
    }
  }
      
  // At this point, either cb() was called with an error, or the object findAndModifySelector is ready to be rolled
  if( findAndModifySelector ){
    this.collectionObject.findAndModify( findAndModifySelector, {}, this.updateObject, {new: true}, cb );
  }
}


MongoStores2.prototype.validate = function( req, next, errors, cb ){
  cb();
}


MongoStores2.prototype.makeGet = function(  ){
   
 var self = this;
 return function( req, res, next ){
   var sendResponse = hotplate.getModule('hotProtocol').sendResponse;
   var perms = hotplate.getModule('hotPerms');
   var errors = [];
   var collectionObject = db.collection( self.collection  );
   
    // Check that paramsId are actually IDs. If there is a problem, fire a synthetic "not found"
   var fireSyntheticNotFound = false;
   if( self.paramsIds ){
     self.paramsIds.forEach( function(k){
       if( ! checkObjectId( req.params[k]  ) )
         errors.push( { field: k, message: 'Invalid ID in URL: ' + k, mustChange: false } );
     });
   }
   if( errors.length ){
     next( new self.e.ValidationError('Validation problems', errors));
     return;
   }
   
   self.findOne( req, next, function( err, doc ){
     exports.checkFindOneResponse( err, doc, next, function(){
       // This is expected to be set  before checkPermissions
       self.fetchedDoc = doc;
       self.setDocSection( req, next, function(){
         self.checkPermissionsGet( req, next, function(){
           self.prepareDocSectionBeforeSend(req, next,  function(){
             sendResponse( res, self.docSection );
            });
         });
       });
     });
   });
 }
   }

MongoStores2.prototype.makePut = function(  ){
  
  var self = this;

  return function( req, res, next ){

    var sendResponse = hotplate.getModule('hotProtocol').sendResponse;
    var e = hotplate.getModule('hotError').errors;
    var perms = hotplate.getModule('hotPerms');
    var messages = hotplate.getModule('hotMongoCometMessages');
    var k, errors = [];
    var collection, validate, findOne;
    var cleanBody;

    // Set the collection
    self.collectionObject = db.collection( self.collection );

    // Check that paramsId are actually IDs
    if( self.paramsIds ){
      self.paramsIds.forEach( function(k){
        if( ! checkObjectId( req.params[k] ) )
          errors.push( { field: k, message: 'Invalid ID in URL: ' + k, mustChange: false } );
      });
    } 
   
    self.schema.cast(  req.body );
    self.schema.check( req.body, errors );

    self.validate( req, next,    errors, function(){
      if( errors.length ){
        next( new e.ValidationError('Validation problems', errors));
      } else {

        // Get the workspace, for permission checking
        self.findOne( req, next,   function( err, doc ){
          exports.checkFindOneResponse( err, doc, next, function(){

            // Sets self.fetchedDoc so that the following functions
            // can use it if they like
            self.fetchedDoc = doc;

            // Sets this.docSection, which is by default the whole fetched doc. However,
            // if there was an elemMatch and daling with a sub-document, the
            // logic to isolate the actual portion being fetch should be here.
            // this.docSection is what will actually get broadcast
            self.setDocSection( req, next, function(){

              // Actually check permissions
              self.checkPermissionsPut( req, next, function(){

 
                cleanBody = {};
                for( var k in req.body )
                  if( ! self.schema.structure[ k ].doNotSave )
                    cleanBody[ k ] = req.body[ k ];
           
                // All clear: set this.updateObject
                self.setUpdateObject( req, next, cleanBody, function(){

                  // Modify the object. findAndModify instead of update, as we need the record to broadcast changes 
                  self.findAndModify( req, next, function( err, doc ) {
                    exports.checkErr( err, doc, next, function(){

                      // Reset fetchedDoc to the latest doc
                      self.fetchedDoc = doc;

                      // Reset docSection once again, now that fetchedDoc has changed
                      self.setDocSection( req, next, function(){

                        // Send empty response as by protocol
                        sendResponse( res );
                    
                        if( ! self.killComet ){
                          self.setBroadcastObject( req, next, function(){
              
                            // Broadcast the change
                            messages.sendToTabsOfWorkspace(

                              // These ones never change
                              req.application.workspace._id,
                              ObjectId( req.body._tabId ),
                              req.application.user._id,
                              'storeUpdate',

                              // These ones do change: it's the message to broadcast
                              { storeName: self.storeName, 
                                objectId: self.broadcastObject._id.toString(),
                                object: self.broadcastObject, 
                                remote: true 
                              } );
                          });
                        }
                      }); // setDocSection

                    }); // checkErr
                  });// findAndModify

                });// setUpdateObject

              });// checkPermissions

            }); // setDocSection

          }); // checkFindOneResponse
        }); // findOne
      }
    }); // validate
  }
}




MongoStores2.prototype.checkPermissionsPost = function( req, next, cb ){
  cb();
}


MongoStores2.prototype.makeQueryGet = function(  ){

}

exports.MongoStores2 = MongoStores2;
exports.Config = MongoStores2;




exports.checkFindOneResponse = function( err, doc, next, cb) {
  var e = hotplate.getModule('hotError').errors;

  if( err ){
    next( new e.RuntimeError( err ) );
  } else {
    if( ! doc ){
      next( new e.NotFoundError() );
    } else {
      cb();
    }
  }
}

exports.checkErr = function( err, doc, next, cb) {
  var e = hotplate.getModule('hotError').errors;

  if( err ){
    next( new e.RuntimeError( err ) );
  } else {
    if( ! doc ){
      next( new Error("Document empty when it really shouldn't be") );
    } else {
      cb();
    }
  }
}







exports.enrichCursorSort = function(urlToParse, cursor, options ){

  var url_parts = url.parse( urlToParse, false );
  var q = url_parts.query || '';
  var sortBy;
  var tokens, subTokens, i;

  options = typeof( options) === 'object' ? options : {};
  options.allowedFields = typeof(options.allowedFields) === 'object' ? options.allowedFields : {};

  tokens = q.split( '&' ).forEach( function( item ) {

    var tokens = item.split('=');
    var tokenLeft = tokens[0];
    var tokenRight = tokens[1];

    // CASE 1: it's a sorting option
    // FIXME: Change make 'sortBy' configurable
    if(tokenLeft === 'sortBy'){
      sortArray = [];
      subTokens = tokenRight.split(',');
      for( i = 0; i < subTokens.length; i++ ){
        // TODO: Check if subTokens[i] is actually allowed as criteria
        if(subTokens[i].match(/[\+\-][a-zA-Z]+/)){
          var sortDirection = subTokens[i][0] == '+' ? 1 : -1;
          sortBy = subTokens[ i ].replace( '+', '' ).replace( '-', '' );
          sortArray.push( [ sortBy, sortDirection ] );
        }
      }
      // Add sorting to the cursor
      if( sortArray.count ){
        cursor.sort(sortArray);
      }
    }
  });
}

exports.enrichCursorRange = function( req, res, cursor, options, cb ){

  var tokens, i;

  options = typeof( options) === 'object' ? options : {};

  // If there was a range request, then set the range to the
  // query and return the count
  var hr;
  if( (hr = req.headers['range']) && ( tokens = hr.match(/items=([0-9]+)\-([0-9]+)$/))  ){
    rangeFrom = tokens[1];
    rangeTo = tokens[2];

    console.log("Requested range from client: " + rangeFrom + '-' + rangeTo );

    cursor.skip( rangeFrom - 0 );
    cursor.limit( rangeTo - rangeFrom + 1);
    console.log("Limiting to " + ( rangeTo - rangeFrom + 1 ) );

    cursor.count( function( err, total ) {
      if( err ){
        cb( err );
      } else {

        res.setHeader('Content-Range', 'items ' + rangeFrom + '-' + rangeTo + '/' + total );
        console.log("Setting header: " + 'items ' + rangeFrom + '-' + rangeTo + '/' + total );
        cb( null );
      }
    });
  } else {
    cb( null );
  }

}



exports.enrichSelector = function( urlToParse, selector, options ){

  var url_parts = url.parse( urlToParse, false );
  var q = url_parts.query || '';
  var tokens, i;
  var tmp;
  var selectorArray = [];

  options = typeof( options) === 'object' ? options : {};
  options.partial = typeof(options.partial) === 'object' ? options.partial : {};

  tokens = q.split( '&' ).forEach( function( item ) {

    var tokens = item.split('=');
    var tokenLeft  = tokens[0];
    var tokenRight = tokens[1];


    if(tokenLeft != 'sortBy' && tokenLeft.match(/[a-zA-Z]+/)){

      tmp = {}
      if( options.partial[ tokenLeft ]){
        tmp[ tokenLeft ] = { $regex: new RegExp('^' + tokenRight + '.*' ) };
      } else {
        // If it is a number, interprets it as a number. This is a bit of guesswork,
        // I think it will be best to have an option to cast values from strings
        if( ! isNaN(tokenRight) ) tokenRight = tokenRight - 0;
        tmp[ tokenLeft ] = tokenRight;
      }
      selectorArray.push( tmp );
    }

  });

  if( selectorArray.length ){
    if( options.operator === 'or'){
      selector['$or'] = selectorArray;
    } else {
      selector['$and'] = selectorArray;
    }
  }


}
