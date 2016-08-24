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
exports.strategyRoutesMaker = function( app, strategyConfig, done ) {

  hotCoreStore.getAllStores( function( err, stores ){
    if( err ) return done( err );

    // Work out callbackURLBase which needs to be honoured
    var callbackURLBase = hotplate.config.get( 'hotCoreAuth.callbackURLBase' );

    function checkFacebookToken( token, cb ){

      var params1 = { qs: { access_token: token, fields: strategyConfig.fieldList }, json: true };
      var params2 = { qs: { access_token: token }, json: true };

/*
{ id: '10208329837673835',
  name: 'Luigi Vitelli',
  first_name: 'Luigi',
  last_name: 'Vitelli',
  age_range: { min: 21 },
  link: 'https://www.facebook.com/app_scoped_user_id/10208329837673835/',
  gender: 'male',
  locale: 'en_US',
  picture:
   { data:
      { is_silhouette: false,
        url: 'https://scontent.xx.fbcdn.net/hprofile-xla1/v/t1.0-1/p50x50/12321463_10207848221353728_979511593533803433_n.jpg?oh=a2f5e1349c7beb9b505e918a9d528122&oe=5784A276' } },
  timezone: 2,
  updated_time: '2016-01-28T16:19:12+0000',
  verified: true,
  email: 'luigi.vitelli23@gmail.com' }
*/


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
          callbackURL: callbackURLBase + hotplate.prefix( "/auth/manager/facebook/callback" ),
          passReqToCallback: true,
        },
        facebookManager
      )
    );

    function facebookManager( req, accessToken, refreshToken, profile, done ) {

      // User is not logged in: nothing to do
      if( ! req.session.loggedIn ) return done( null, false, { message: "You must be logged in" } );

      // The profile MUST contain an ID
      if( typeof( profile ) === 'undefined' || ! profile.id ){
         return done( null, false, { message: "Facebook didn't return a profile ID, procedure aborted" } );
      }

      // Check that the user doesn't already have "facebook" as a strategy
      stores.usersStrategies.dbLayer.selectByHash( { userId: req.session.userId, strategyId: 'facebook' }, function( err, res ){
        if( err ) return done( err, false );
        if( res.length ) return done( null, false, { message: "User already has a Facebook login setup" } );

        // Check that _that_ specific facebook ID is not associated to an account
        stores.usersStrategies.dbLayer.selectByHash( { field1: profile.id }, { children: true }, function( err, res ){
          if( err ) return done( err, false );
          if( res.length ) return  done( null, false, { message: "Facebook profile already linked to another account" } );

          // This is an apiPost so that change is passed through comet to the clients
          stores.usersStrategies.apiPost( { userId: req.session.userId, strategyId: 'facebook', field1: profile.id, field3: accessToken, field4: refreshToken }, function( err, res ){
            if( err ) return  done( err, false );

            // Allow other modules to enrich the returnObject if they like
            var returnObject = { id: res.userId };
            hotplate.hotEvents.emitCollect( 'auth', 'facebook', 'manager', { returnObject: returnObject, userId: res.userId, accessToken: accessToken, refreshToken: refreshToken, profile: profile }, function( err ){
              if( err ) return done( err, null );

              done( null, returnObject, profile );
            });
          });
        });
      });
    }


    app.get( hotplate.prefix( '/auth/manager/facebook/web' ), passport.authenticate('facebook-manager'));
    app.get( hotplate.prefix( '/auth/manager/facebook/callback' ), function( req, res, next) {
      passport.authenticate('facebook-manager',  makeResponder( req, res, next, 'facebook', 'manager')  )( req, res, next );
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
          callbackURL: callbackURLBase + hotplate.prefix( "/auth/signin/facebook/callback" ),
          passReqToCallback: true,
        },
        facebookSignin
      )
    );

    function facebookSignin( req, accessToken, refreshToken, profile, done ) {

      if( req.session.loggedIn ) return done( null, false, { alreadyLoggedIn: true } );

      //console.log( "ACCESS TOKEN: ", accessToken );
      //console.log( "REFRESH TOKEN: ", refreshToken );
      //console.log( "PROFILE: ", profile );
      // The profile MUST contain an ID
      if( typeof( profile ) === 'undefined' || ! profile.id ){
         return done( null, false, { message: "Facebook didn't return a profile ID, procedure aborted" } );
      }

      stores.usersStrategies.dbLayer.selectByHash( { strategyId: 'facebook', field1: profile.id }, { children: true }, function( err, res ){
        if( err ) return done( err, null );

        if( ! res.length ) return done( null, false, { message: "Your Facebook user is not registered" } );

        stores.usersStrategies.dbLayer.updateByHash( { strategyId: 'facebook', field1: profile.id }, { field3: accessToken }, function( err, n ){

          if( err ) return done( err, null );

          // Allow other modules to enrich the returnObject if they like
          var returnObject = { id: res[0].userId };
          hotplate.hotEvents.emitCollect( 'auth', 'facebook', 'signin', { returnObject: returnObject, userId: res[0].userId, accessToken: accessToken, refreshToken: refreshToken, profile: profile }, function( err ){
            if( err ) return done( err, null );

            req.session.loggedIn = true;
            req.session.userId = res[0].userId;
            done( null, returnObject, profile  );
	  })
	})
      })
    }

    app.get( hotplate.prefix( '/auth/signin/facebook/web' ), passport.authenticate('facebook-signin'));
    app.get( hotplate.prefix( '/auth/signin/facebook/callback' ), function( req, res, next) {
      passport.authenticate('facebook-signin',  makeResponder( req, res, next, 'facebook', 'signin')  )(req, res, next);
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
          callbackURL: callbackURLBase + hotplate.prefix( "/auth/register/facebook/callback" ),
          passReqToCallback: true,
        },
        passportRegister
      )
    );

    function passportRegister( req, accessToken, refreshToken, profile, done ) {

      //console.log( "ACCESS TOKEN: ", accessToken );
      //console.log( "REFRESH TOKEN: ", refreshToken );
      //console.log( "PROFILE: ", profile );

      // User is already logged in: nothing to do
      if( req.session.loggedIn ) return done( null, false, { alreadyLoggedIn: true } );

      // The profile MUST contain an ID
      if( typeof( profile ) === 'undefined' || ! profile.id ){
         return done( null, false, { message: "Facebook didn't return a profile ID, procedure aborted" } );
      }

      // Check that _that_ specific facebook ID is not associated to an account
      stores.usersStrategies.dbLayer.selectByHash( { strategyId: 'facebook', field1: profile.id }, { children: true }, function( err, res ){
        if( err ) return done( err, null );

        if( res.length ) return done( null, false, { message: "Facebook profile already registered" } );

        // Add a user. It's really about creating an ID
        stores.users.dbLayer.insert( {}, function( err, user ){
          if( err ) return done( err, null );

          stores.usersStrategies.dbLayer.insert( { userId: user.id, strategyId: 'facebook', field1: profile.id, field3: accessToken, field4: refreshToken }, function( err, res ){
            if( err ) return done( err, null );

            // User just registered: make her "logged in"
            req.session.loggedIn = true;
            req.session.userId = res.userId;

            // Allow other modules to enrich the returnObject if they like
            var returnObject = { id: res.userId };
            hotplate.hotEvents.emitCollect( 'auth', 'facebook', 'register', { returnObject: returnObject, userId: user.id, accessToken: accessToken, refreshToken: refreshToken, profile: profile }, function( err ){
              if( err ) return done( err, null );

              done( null, returnObject, profile );
            });
          });
        });
      });
    }

    app.get( hotplate.prefix( '/auth/register/facebook/web' ), passport.authenticate('facebook-register'));
    app.get( hotplate.prefix( '/auth/register/facebook/callback' ), function( req, res, next) {
      passport.authenticate('facebook-register',  makeResponder( req, res, next, 'facebook', 'register')  )(req, res, next);
    });
    app.post( hotplate.prefix( '/auth/register/facebook/postcheck'), function( req, res, next ){

      checkFacebookToken( req.body.accessToken, function( err, profile ){
        if( err ) return next( err );

        passportRegister( req, req.body.accessToken, req.body.refreshToken, profile, makeResponder( req, res, next, 'facebook', 'register' ) );
      });
    });

    done( null );

  });
}
