/*jslint node: true */

"use strict";

var dummy
  , path = require('path')
  , hotplate = require('hotplate')
  , declare = require('simpledeclare')
  , async = require('async')

  , SimpleSchema = require( 'simpleschema' )
  , JsonRestStores = require( 'jsonreststores' )

  , hotCoreStore = require( 'hotplate/core_modules/hotCoreStore' )
  , hotCoreServerLogger = require( 'hotplate/core_modules/hotCoreServerLogger' )
  , e = require( 'allhttperrors' )

;


/**
  The stock function that will return an HTML page responsible of displaying content. Typically, this window should stay up for a few seconds, before self-closing.

  This is definitely too basic for _any_ use, since all it does is display "RESPONSE". You will definitely need to customise it so that it does something useful.
*/
var basicContentResponsePage = function( strategyId, action, user, profile ){
  var response = '';
  response += "<html><body><script type=\"text/javascript\">setTimeout(function(){ window.close() }, 5000);</script>RESPONSE</body></html>";
  return response;
};

var stores = {}


/**
  The stock function that will return an HTML page responsible of 1) Closing the current window 2) Display `profile.message` if login failed and there is a message to display.
  This is probably too basic for a real use, but it works.
*/
var basicCloseResponsePage = function( strategyId, action, user, profile ){
  // If !user, and there is a message, display that message
  if( ! user && typeof( profile.message) !== 'undefined'  ){
    // FIXME: http://stackoverflow.com/questions/17141863/escaping-error-message-in-javascript
    return '<html><script>window.opener.alert("' + profile.message + '");window.close();</script></html>';
  } else {
    return '<html><script>window.close();</script></html>';
  }
}


/**
  The stock function that will return an HTML page responsible of 1) Closing the current window 2) Redirect the opener to the hotCoreAuth.redirectURLs.success[action] URL (if authentication was successful) or display the error message.
ttribute (for example ``{ message: "Login failed" }`)
*/
var basicRedirectOpenerResponsePage = function( strategyId, action, user, profile ){
  if( ! user && typeof( profile.message) !== 'undefined'  ){
    // FIXME: http://stackoverflow.com/questions/17141863/escaping-error-message-in-javascript
    return '<html><script>window.opener.alert("' + profile.message + '");window.close();</script></html>';
  } else {
    var redirectURL = hotplate.config.get('hotCoreAuth.redirectURLs.success.' + action) || '/';
    return '<html><script>window.opener.location = "' + redirectURL + '";window.close();</script></html>';
  }
};

hotplate.config.set('hotCoreAuth', {

  callbackURLBase: 'http://localhost:3000',

  recoverURLexpiry: 60*30, // Seconds for which the recover URL works for
  recoverRedirectOnSuccess: '/',

  defaultResponseType: 'ajax',

  // Only local strategy enabled by default
  strategies: {
    local: { },
  },

  redirectURLs: {
    success: {
      signin: hotplate.prefix( '/' ),
      recover: hotplate.prefix( '/' ),
      register: hotplate.prefix( '/' ),
      manager: hotplate.prefix( '/' ),
    },

    fail: {
      signin: hotplate.prefix( '/' ),
      recover: hotplate.prefix( '/' ),
      register: hotplate.prefix(  '/' ),
      manager: hotplate.prefix( '/' ),
    },
  },
  contentResponsePage: basicContentResponsePage,
  closeResponsePage: basicCloseResponsePage,
  redirectOpenerResponsePage: basicRedirectOpenerResponsePage,
  always200OnAjaxResponse: false,
});

/**
  Returns a function with signature `function( err, user, profile )`,
  which will serve the right response depending on the cookie
  called `strategyId + '-' + action`

  It might redirect, close, redirect opener and close, return JSON, etc.

  @methodIgnored makeResponder
  @param {Object} req Express' `req`
  @param {Object} res Express' `res`
  @param {Function} next Express' `next()`
  @param {String} strategyIdThe make of the strategy (e.g. 'facebook', 'local')
  @param {String} action The action (`signin`, `recover`, `register`, `resume`, `manager`)
*/
exports.makeResponder = function( req, res, next, strategyId, action, forceAjaxResponse ) {

  return function(err, user, profile ) {
    if( err ) return next( err );


    var responseType, strategies;

    var k = req.cookies[ strategyId + '-' + action ];
    if( typeof( k ) !== 'undefined' ){
      responseType = k;
    }

    // Fallback option
    if( ! responseType ) responseType = hotplate.config.get( 'hotCoreAuth.defaultResponseType', 'redirect' );

    // Force to "ajax" response type if so commanded
    if( forceAjaxResponse ) responseType = 'ajax';

    // Defaults to an empty profile object
    if( typeof( profile ) === 'undefined' ){
      profile = {};
    }

    // Error: just return/next that
    if( err ) { return next( err ); }

    switch( responseType ){

      case 'content':
        // Work out the page's content by calling the user-set hotCoreAuth/contentResponsePage function
        var contentFunction = hotplate.config.get( 'hotCoreAuth.contentResponsePage' );
        var content = contentFunction( strategyId, action, user, profile );
        res.send( content );
      break;

      case 'close':
        // Work out the page's content by calling the user-set hotCoreAuth/contentResponsePage function
        var contentFunction = hotplate.config.get( 'hotCoreAuth.closeResponsePage' );
        var content = contentFunction( strategyId, action, user, profile );
        res.send( content );
      break;

      case 'ajax':
          var returnedStatus;
          var returnedObject = { strategyId: strategyId, action: action, user: user, profile: profile };

          if( ! user && !hotplate.config.get( 'hotCoreAuth.always200OnAjaxResponse') ){
            returnedStatus = 401;
            returnedObject.message = profile.message;
            returnedObject.code = profile.code;
          } else {
            returnedStatus = 200;
          }

          res.json( returnedStatus, returnedObject );
      break;

      case 'redirect-opener':
        // Work out the page's content by calling the user-set hotCoreAuth/contentResponsePage function
        var contentFunction = hotplate.config.get( 'hotCoreAuth.redirectOpenerResponsePage' );
        var content = contentFunction( strategyId, action, user, profile );
        res.send( content );
      break;

      case 'redirect':
      default:

        if( user ){
          var redirectURL = hotplate.config.get('hotCoreAuth.redirectURLs.success.' + action) || '/';
          res.redirect( redirectURL );
        } else {

          // Add the error to the session messages
          if( typeof( profile.message) !== 'undefined'  ){
            req.session.messages = req.session.messages || [];
            req.session.messages.push( { type: 'error', message: profile.message } );
          }

          var redirectURL = hotplate.config.get('hotCoreAuth.redirectURLs.fail.' + action) || '/';
          res.redirect( redirectURL );
        }
      break;
    }
  };
};


hotplate.hotEvents.onCollect( 'stores', 'hotCoreAuth', hotplate.cacheable( function( done ){


  hotCoreStore.get( function( err, s ){
    if( err ) return done( err );

    var HotStore = s.HotStore;
    var HotSchema = s.HotSchema;

    // ***********************************
    // *** USERS *************************
    // ***********************************

    var Users = declare( HotStore, {

      schema: new HotSchema({
        id                 : { type: 'id' },
        recoverToken       : { type: 'blob', searchable: true, notempty: true },
        recoverTokenCreated: { type: 'date', searchable: true, notempty: true },
      }),

      storeName:  'users',
      idProperty: 'id',
    });
    stores.users = new Users();

    var UsersStrategies = declare( HotStore, {

      schema: new HotSchema({
        strategyId:  { type: 'blob', searchable: true, required: true, trim: 30 }  ,
        field1:      { type: 'blob', searchable: true, required: false, trim: 255 } ,
        field2:      { type: 'blob', searchable: true, required: false, trim: 255 } ,
        field3:      { type: 'blob', searchable: true, required: false, trim: 255 } ,
        field4:      { type: 'blob', searchable: true, required: false, trim: 255 } ,
      }),

      // Nothing is searchable in usersStrategies by default
      onlineSearchSchema: new HotSchema({
      }),

      storeName:  'usersStrategies',

      publicURL: '/users/:userId/strategies/:id',
      hotExpose: true,

      preserveCacheOnReset: true,

      handleGet: true,
      handleGetQuery: true,
      handleDelete: true,

      checkPermissions: function( request, method, cb ){

       if( !request.session.loggedIn ) return cb( new e.UnauthorizedError() );

        switch( method ){
          case 'get':
          case 'getQuery':
            // Only their own strategies
            if( request.session.userId != request.params.userId ) return cb( null, false );
            return cb( null, true );
          break;

          case 'delete':

            // Only their own strategies
            if( request.session.userId != request.params.userId ) return cb( null, false );

            // Don't allow them to delete the last remaining strategy, or they will not be allowed back in
            stores.usersStrategies.dbLayer.selectByHash( { conditions: { userId: request.data.fullDoc.userId } }, { children: true }, function( err, queryDocs) {
              if( err ) return cb( err );

              if( queryDocs.length > 1 ){
                cb( null, true );
              } else {
                cb( null, false );
              }
            });
          break;

          default:
            // Let it pass by default
            return cb( null, true );
          break;

        }
      },

      // Make sure that, if the request is from the web, field3 and field4 are out of the equation as
      // they often include nice goodies like passwords etc.
      extrapolateDoc: function( request, method, doc, cb ){

        var doc = this._co( doc );

        // Local request: all good
        if( ! request.remote ) return cb( null, doc );

        // Remote request: delete field, and return
        delete doc[ 'field3' ];
        delete doc[ 'field4' ];

        cb( null, doc );

      },

    });
    stores.usersStrategies = new UsersStrategies();


    var AuthStrategies = declare( JsonRestStores, JsonRestStores.HTTPMixin, {

      schema: new SimpleSchema({
        id:        { type: 'blob', isRequired: true, trim: 30 }  ,
      }),

      handleGet: true,
      handleGetQuery: true,

      storeName:  'authStrategies',

      //logError: function( error ){ hotCoreServerLogger.log( error ); },

      publicURL: '/authstrategies/:id',
      hotExpose: true,

      implementFetchOne: function( request, cb ){
        var strategies = hotplate.config.get('hotCoreAuth.strategies');
        var doc;

        // No strategies defined in Hotplate, end of story
        if( typeof( strategies ) === 'undefined' ){
          return cb( null, null );
        }

        // Check if the strategy is one of the ones defined in Hotplate
        if( typeof( strategies[ params.id ] ) !== 'undefined' ){
          doc = {}
          doc.id = params.id;
        } else {
          doc = null;
        }

        // Return whatever was found
        cb( null, doc );
      },

      implementQuery: function( request, cb ){
        var strategies = hotplate.config.get('hotCoreAuth.strategies');
        var doc;
        var docs = [];

        for( var strategyId in strategies ){
          docs.push( { id: strategyId } );
        }
        cb( null, docs );
      },


    });

    stores.authStrategies = new AuthStrategies();

    // Calls `strategyExtraStores()` for each extra strategy
    async.eachSeries(
      Object.keys( hotplate.config.get('hotCoreAuth.strategies', {} )),
      function( strategyName, cb ){

        var strategyExtraStores = require( './auth/' + strategyName ).extraStores;
        if( ! strategyExtraStores ) return cb( null );

        strategyExtraStores( stores, function( err ){
          if( err ) return cb( err );

          // That's it -- end of the function.
          cb( null);
        });
      },
      function( err ){
        if( err ) return done( err );

        done( null, stores );
      }
    );

  });
}))


var checkToken = exports.checkToken = function( token, cb ){

  stores.users.dbLayer.selectByHash( { recoverToken: token }, function( err, result, total ){
    if( err ) return cb( err );

    // No joy: token isn't there
    if( total == 0 ) return cb( null, false, "Token not found" );

    var user = result[ 0 ];

    // The token's date is invalid
    if( ! user.recoverTokenCreated ) return cb( null, false, "Token seems expired" );

    // Get the important variables
    var tokenAgeInSeconds = Math.round( ( (new Date() ) - user.recoverTokenCreated ) / 1000 );
    var recoverURLexpiry = hotplate.config.get( 'hotCoreAuth.recoverURLexpiry' );
    var tokenIsGood = tokenAgeInSeconds < recoverURLexpiry;

    if( tokenIsGood ){
      return cb( null, true, user.id );
    } else {
      return cb( null, false, "Token is expired" );
    }
  });
}

var clearToken = exports.clearToken = function( userId, cb ){

  // Clear the token for that user
  stores.users.dbLayer.updateById( userId, { recoverToken: null, recoverTokenCreated: null }, function( err ){
    if( err ) return cb( err );

    cb( null );
  });
}

var createToken = exports.createToken = function( userId, cb ){

  // Make up the token, add it to the users table
  var token = require('crypto').randomBytes(48).toString( 'base64' ).replace(/[^a-zA-Z0-9]/g,'').substr(0,25)
  stores.users.dbLayer.updateById( userId, { recoverToken: token, recoverTokenCreated: new Date() }, function( err ){
    if( err ) return cb( err );

    cb( null, token );
  });
}


hotplate.hotEvents.onCollect( 'setRoutes', function( app, done ){

  // Calls `strategy.strategyRoutesMaker()` for each extra strategy-related routes
  async.eachSeries(
    Object.keys( hotplate.config.get('hotCoreAuth.strategies', {} )),
    function( strategyName, cb ){

      var strategyRoutesMaker = require( './auth/' + strategyName ).strategyRoutesMaker;
      if( ! strategyRoutesMaker ) return cb( null );

      var strategyConfig = hotplate.config.get('hotCoreAuth.strategies' )[ strategyName ];
      strategyRoutesMaker( app, strategyConfig, function( err ){
        if( err ) return cb( err );

        // That's it -- end of the function.
        cb( null);
      });
    },
    function( err ){
      if( err ) return done( err );


      // Make up route to recover the password.
      app.get( hotplate.prefix( '/auth/recoverPage/:token'), function (req, res, next) {

        req.session = {};

        var token = req.params['token'];

        checkToken(token, function (err, tokenIsGood, errorMessageOrUserId) {
          if (err) return next(err);
          if (!tokenIsGood) return next(new e.UnprocessableEntityError(errorMessageOrUserId));

          // The token is good: clear it, set the session, and redirect
          clearToken(errorMessageOrUserId, function (err) {
            if (err) return next(err);

            // Log the user in using the token!
            req.session.loggedIn = true;
            req.session.userId = errorMessageOrUserId;

            // Redirect to the recoverRedirectOnSuccess URL
            res.redirect( hotplate.config.get( 'hotCoreAuth.recoverRedirectOnSuccess') );
          })
        });
      });



      done( null );
    }
  );

});
