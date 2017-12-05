"use strict";

/**
This file is a "plugin" for hotCoreAuth, and implements:

* `strategyRoutesMaker( app,  done )`

Which will create the right routes so that Facebook authentication works.

@class hotCoreAuth.facebook
@static
*/

var dummy
  , path = require('path')
  , hotplate = require('hotplate')

  , hat = require('hat')

  , passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , hotCoreAuth = require('hotplate/core_modules/hotCoreAuth')
  , hotCoreStore = require('hotplate/core_modules/hotCoreStore')
  , request = require( 'request')
;

var makeResponder = hotCoreAuth.makeResponder;

/**
Returns a function compatible with hotCoreAuth to implement Facebook authentication.
It will set the following routes:

  * Manager: `/auth/manager/facebook`, `/auth/manager/facebook/callback`
  * Signin: `/auth/signin/facebook`, `/auth/manager/signin/callback`
  * Recover: `/auth/recover/facebook`, `/auth/manager/recover/callback`
  * Register: `/auth/register/facebook`, `/auth/manager/register/callback`
  * Resume: `/auth/resume/facebook`, `/auth/manager/resume/callback`

In usersStrategies:

* `field1` is used to store the Facebook profile ID

While managing the passwords, if the client sends `*` as the password, the old password is retained.

@method exports
@param {Object} stores The hash of all available stores. Mainly passed to optimise
*/

var DEFAULT_PROFILE_FIELDS = [ 'id','name','age_range','link','gender','locale','picture','timezone','updated_time','verified','email' ];
var DEFAULT_SCOPE = [ 'public_profile', 'user_friends' ];

exports.strategyRoutesMaker = function( app, strategyConfig, done ) {

  hotCoreStore.getAllStores( function( err, stores ){
    if( err ) return done( err );

    // Work out callbackURLBase which needs to be honoured
    //var callbackURLBase = hotplate.config.get( 'hotCoreAuth.callbackURLBase' );

    function checkFacebookToken( token, cb ){

      var fields = strategyConfig.profileFields || DEFAULT_PROFILE_FIELDS;
      if( Array.isArray( fields ) ) fields = fields.join( ',' );

      var params1 = { qs: { access_token: token, fields: fields }, json: true };
      var params2 = { qs: { access_token: token }, json: true };

      request.get( 'https://graph.facebook.com/me', params1, function( err, response, profile ){
        if( err ) return cb( err );

        request.get( 'https://graph.facebook.com/app', params2, function( err, response, appInfo ){
          if( err ) return cb( err );

          //console.log( "PROFILE: ", profile );
          //console.log( "APPINFO: ", appInfo );

          if( strategyConfig.clientID != appInfo.id ){
            var e = new Error("No match for app ID");
            return cb( e );
          }
          cb( null, profile );
        });
      });
    }



    // ***********************
    // *** MANAGER         ***
    // ***********************

    passport.use(
      'facebook-manager',
      new FacebookStrategy(
        {
          clientID: strategyConfig.clientID,
          clientSecret: strategyConfig.clientSecret,
          //callbackURL: callbackURLBase + hotplate.prefix( "/auth/manager/facebook/callback" ),
          profileFields: strategyConfig.profileFields || DEFAULT_PROFILE_FIELDS,
          passReqToCallback: true,
        },
        facebookManager
      )
    );

    function facebookManager( req, accessToken, refreshToken, profile, done ) {

      // User is not logged in: nothing to do
      if( ! req.session.loggedIn ) return done( null, false, { message: "You must be logged in", code: "NOT_LOGGED_IN" } );

      // The profile MUST contain an ID
      if( typeof( profile ) === 'undefined' || ! profile.id ){
         return done( null, false, { message: "Facebook didn't return a profile ID, procedure aborted", code: "NO_PROFILE" } );
      }

      // Check that the user doesn't already have "facebook" as a strategy
      stores.usersStrategies.dbLayer.selectByHash( { userId: req.session.userId, strategyId: 'facebook' }, function( err, res ){
        if( err ) return done( err );


        if( res.length ) return done( null, false, { message: "User already has a Facebook login setup", code: "ALREADY_LINKED" } );

        // Check that _that_ specific facebook ID is not associated to an account
        stores.usersStrategies.dbLayer.selectByHash( { field1: profile.id }, { children: true }, function( err, res ){
          if( err ) return done( err );

          if( res.length ) return  done( null, false, { message: "Facebook profile already linked to another account", code: "ALREADY_LINKED_OTHER_USER" } );

          // This is an apiPost so that change is passed through comet to the clients
          stores.usersStrategies.apiPost( { userId: req.session.userId, strategyId: 'facebook', field1: profile.id, field3: accessToken, field4: refreshToken }, function( err, res ){
            if( err ) return  done( err );

            // Allow other modules to enrich the returnObject if they like
            var returnObject = { id: res.userId };
            hotplate.hotEvents.emitCollect( 'auth', 'facebook', 'manager', { request: req, returnObject: returnObject, userId: res.userId, accessToken: accessToken, refreshToken: refreshToken, profile: profile }, function( err ){
              if( err ) return done( err );

              done( null, returnObject, profile );
            });
          });
        });
      });
    }

    app.get( hotplate.prefix( '/auth/manager/facebook/web' ), function( req, res, next ){
      var callbackURLBase = hotplate.config.get( 'hotCoreAuth.callbackURLBase' );
      if( typeof callbackURLBase === 'function') {
        callbackURLBase = callbackURLBase( req );
      }
      var callbackURL = callbackURLBase + hotplate.prefix( "/auth/manager/facebook/callback" )
      passport.authenticate('facebook-manager',  { scope: strategyConfig.profileScope || DEFAULT_SCOPE, callbackURL: callbackURL } )( req, res, next );
    });


    app.get( hotplate.prefix( '/auth/manager/facebook/callback' ), function( req, res, next) {

      // Why callbackURL is mandatory IN THE CALLBACK escapes me...
      var callbackURLBase = hotplate.config.get( 'hotCoreAuth.callbackURLBase' );
      if( typeof callbackURLBase === 'function') {
        callbackURLBase = callbackURLBase( req );
      }
      var callbackURL = callbackURLBase + hotplate.prefix( "/auth/manager/facebook/callback" );
      passport.authenticate('facebook-manager',  { callbackURL: callbackURL }, makeResponder( req, res, next, 'facebook', 'manager')  )( req, res, next );
    });

    app.post( hotplate.prefix( '/auth/manager/facebook/postcheck'), function( req, res, next ){

      checkFacebookToken( req.body.accessToken, function( err, profile ){
        if( err ) return next( err );

        // TODO: Check token. Then...
        facebookManager( req, req.body.accessToken, req.body.refreshToken, profile, makeResponder( req, res, next, 'facebook', 'manager' ) );
      });
    });


    // ***********************
    // *** SIGN IN         ***
    // ***********************

    passport.use( 'facebook-signin',
      new FacebookStrategy(
        {
          clientID: strategyConfig.clientID,
          clientSecret: strategyConfig.clientSecret,
          //callbackURL: callbackURLBase + hotplate.prefix( "/auth/signin/facebook/callback" ),
          profileFields: strategyConfig.profileFields || DEFAULT_PROFILE_FIELDS,
          passReqToCallback: true,
        },
        facebookSignin
      )
    );

    function facebookSignin( req, accessToken, refreshToken, profile, done ) {

      if( req.session.loggedIn ) return done( null, false, { message: "User is already logged in", code: "ALREADY_LOGGED_IN" } );

      var userId;

      //console.log( "ACCESS TOKEN: ", accessToken );
      //console.log( "REFRESH TOKEN: ", refreshToken );
      //console.log( "PROFILE: ", profile );
      // The profile MUST contain an ID
      if( typeof( profile ) === 'undefined' || ! profile.id ){
         return done( null, false, { message: "Facebook didn't return a profile ID, procedure aborted", code: "NO_PROFILE" } );
      }

      stores.usersStrategies.dbLayer.selectByHash( { strategyId: 'facebook', field1: profile.id }, { children: true }, function( err, res ){
        if( err ) return done( err, null );

        // No user was found. At this point, a user will be created
        // on the spot, and it will be associated this facebook strategy.
        // This is crucial, to make sure that "login" with Facebook
        // works regardless
        if( ! res.length ){

          // if strictLogin is enabled, then a profile MUST be linked
          // beforehand, or it won't work.
          if( strategyConfig.strictLogin ){
            return done( null, false, { message: "Your Facebook user is not registered", code: "NOT_LINKED" } );
          }

          // Add a user. It's really about creating an ID
          stores.users.dbLayer.insert( {}, function( err, user ){
            if( err ) return done( err, null );

            stores.usersStrategies.dbLayer.insert( { userId: user.id, strategyId: 'facebook', field1: profile.id, field3: accessToken, field4: refreshToken }, function( err, res ){
              if( err ) return done( err, null );

              userId = user.id;

              finishOff('register');
            });
          });
        } else {

          // Update the access token
          stores.usersStrategies.dbLayer.updateByHash( { strategyId: 'facebook', field1: profile.id }, { field3: accessToken }, function( err, n ){
            if( err ) return done( err, null );

            userId = res[0].userId;

            finishOff('signin');
          });
        }

        function finishOff( action ){

          // Allow other modules to enrich the returnObject if they like
          var returnObject = { id: userId };
          hotplate.hotEvents.emitCollect( 'auth', 'facebook', action, { request: req, returnObject: returnObject, userId: userId, accessToken: accessToken, refreshToken: refreshToken, profile: profile }, function( err, preventLogin ){
            if( err ) return done( err, null );

            // Authentication was artificially prevented by callback
            if( preventLogin.onlyResults().indexOf( true ) != -1 ){
              return done( null, false, { message: "Login failed", code: "LOGIN_FAILED"} );
            }

            req.session.loggedIn = true;
            req.session.userId = userId;

            done( null, returnObject, profile  );
          });
        }

      })
    }

    app.get( hotplate.prefix( '/auth/signin/facebook/web' ), function( req, res, next ){
      var callbackURLBase = hotplate.config.get( 'hotCoreAuth.callbackURLBase' );
      if( typeof callbackURLBase === 'function') {
        callbackURLBase = callbackURLBase( req );
      }
      var callbackURL = callbackURLBase + hotplate.prefix( "/auth/signin/facebook/callback" );
      passport.authenticate('facebook-signin',  { scope: strategyConfig.profileScope || DEFAULT_SCOPE, callbackURL: callbackURL } )( req, res, next );
    });

    app.get( hotplate.prefix( '/auth/signin/facebook/callback' ), function( req, res, next) {

      // Why callbackURL is mandatory IN THE CALLBACK escapes me...
      var callbackURLBase = hotplate.config.get( 'hotCoreAuth.callbackURLBase' );
      if( typeof callbackURLBase === 'function') {
        callbackURLBase = callbackURLBase( req );
      }
      var callbackURL = callbackURLBase + hotplate.prefix( "/auth/signin/facebook/callback" );
      passport.authenticate('facebook-signin',  { callbackURL: callbackURL }, makeResponder( req, res, next, 'facebook', 'signin')  )(req, res, next);
    });
    app.post( hotplate.prefix( '/auth/signin/facebook/postcheck' ), function( req, res, next ){

      checkFacebookToken( req.body.accessToken, function( err, profile ){
        if( err ) return next( err );

        facebookSignin( req, req.body.accessToken, req.body.refreshToken, profile, makeResponder( req, res, next, 'facebook', 'signin') );
      });

    })

    // ***********************
    // *** REGISTER        ***
    // ***********************

    passport.use(
      'facebook-register',
      new FacebookStrategy(
        {
          clientID: strategyConfig.clientID,
          clientSecret: strategyConfig.clientSecret,
          //callbackURL: callbackURLBase + hotplate.prefix( "/auth/register/facebook/callback" ),
          profileFields: strategyConfig.profileFields || DEFAULT_PROFILE_FIELDS,
          passReqToCallback: true,
        },
        facebookRegister
      )
    );

    function facebookRegister( req, accessToken, refreshToken, profile, done ) {

      //console.log( "ACCESS TOKEN: ", accessToken );
      //console.log( "REFRESH TOKEN: ", refreshToken );
      //console.log( "PROFILE: ", profile );

      // User is already logged in: nothing to do
      if( req.session.loggedIn ) return done( null, false, { message: "User is already logged in", code: "ALREADY_LOGGED_IN" } );

      // The profile MUST contain an ID
      if( typeof( profile ) === 'undefined' || ! profile.id ){
         return done( null, false, { message: "Facebook didn't return a profile ID, procedure aborted" } );
      }

      // Check that _that_ specific facebook ID is not associated to an account
      stores.usersStrategies.dbLayer.selectByHash( { strategyId: 'facebook', field1: profile.id }, { children: true }, function( err, res ){
        if( err ) return done( err );

        if( res.length ) return done( null, false, { message: "Facebook profile already registered", code: "ALREADY_LINKED_OTHER_USER" } );

        // Add a user. It's really about creating an ID
        stores.users.dbLayer.insert( {}, function( err, user ){
          if( err ) return done( err );

          stores.usersStrategies.dbLayer.insert( { userId: user.id, strategyId: 'facebook', field1: profile.id, field3: accessToken, field4: refreshToken }, function( err, res ){
            if( err ) return done( err );

           // Allow other modules to enrich the returnObject if they like
            var returnObject = { id: res.userId };
            hotplate.hotEvents.emitCollect( 'auth', 'facebook', 'register', { request: req, returnObject: returnObject, userId: user.id, accessToken: accessToken, refreshToken: refreshToken, profile: profile }, function( err ){
              if( err ) return done( err );

              // User just registered: make her "logged in"
              req.session.loggedIn = true;
              req.session.userId = res.userId;

              done( null, returnObject, profile );
            });
          });
        });
      });
    }

    app.get( hotplate.prefix( '/auth/register/facebook/web' ), function( req, res, next ){
      var callbackURLBase = hotplate.config.get( 'hotCoreAuth.callbackURLBase' );
      if( typeof callbackURLBase === 'function') {
        callbackURLBase = callbackURLBase( req );
      }
      var callbackURL = callbackURLBase + hotplate.prefix( "/auth/register/facebook/callback" )
      passport.authenticate('facebook-register',  { scope: strategyConfig.profileScope || DEFAULT_SCOPE, callbackURL: callbackURL } )( req, res, next );
    });

    app.get( hotplate.prefix( '/auth/register/facebook/callback' ), function( req, res, next) {


      // Why callbackURL is mandatory IN THE CALLBACK escapes me...
      var callbackURLBase = hotplate.config.get( 'hotCoreAuth.callbackURLBase' );
      if( typeof callbackURLBase === 'function') {
        callbackURLBase = callbackURLBase( req );
      }
      var callbackURL = callbackURLBase + hotplate.prefix( "/auth/register/facebook/callback" );

      passport.authenticate('facebook-register', { callbackURL: callbackURL }, makeResponder( req, res, next, 'facebook', 'register')  )(req, res, next);
    });
    app.post( hotplate.prefix( '/auth/register/facebook/postcheck'), function( req, res, next ){

      checkFacebookToken( req.body.accessToken, function( err, profile ){
        if( err ) return next( err );

        facebookRegister( req, req.body.accessToken, req.body.refreshToken, profile, makeResponder( req, res, next, 'facebook', 'register' ) );
      });
    });

    done( null );

  });
}
