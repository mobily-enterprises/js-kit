"use strict";

/**
This file is a "plugin" for hotCoreAuth, and provides two methods:

* `extraStores( stores, done )`
* `strategyRoutesMaker( app, done )`

Which will add an extra store (`logins`) and will create the right routes so that local authentication works.

@class hotCoreAuth.local
@static
*/

var dummy
  , path = require('path')
  , hotplate = require('hotplate')
  , JsonRestStores = require( 'jsonreststores' )
  , SimpleSchema = require( 'simpleschema' )
  , declare = require('simpledeclare')

  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , hat = require('hat')
  , bcrypt = require('bcrypt')
  , hotCoreAuth = require('hotplate/core_modules/hotCoreAuth')
  , hotCoreStore = require('hotplate/core_modules/hotCoreStore')
  , e = require( 'allhttperrors' )
;

var SALT_WORK_FACTOR = 15;

var makeResponder = hotCoreAuth.makeResponder;

exports.extraStores = function( stores, done ){

  // This is used so that an applicaton can know in advance if a user login is already taken
  var Logins = declare( JsonRestStores, JsonRestStores.HTTPMixin, {

    schema: new SimpleSchema({
      login     : { type: 'string', required: true, lowercase: true, trim: 30, searchable: true },
    }),

    storeName:  'logins',

    handleGetQuery: true,

    publicURL: '/logins/:id',
    hotExpose: true,

   // This is descriptive only
    queryConditions: {
      type: 'eq',
      args: [ 'login', '#login' ]
    },

    implementQuery: function( request, cb ){

      var self = this;

      stores.usersStrategies.dbLayer.selectByHash( { strategyId: 'local', field1: request.options.conditionsHash.login }, { children: true }, function( err, res ){
        if( err ) return cb( err );

        // Return the login
        if( ! res.length) return cb( null, [ ] );
        cb( null, [ { login: request.options.conditionsHash.login } ] );

      });

    },

  });
  stores.logins = new Logins();

  done( null );
}


/**
A function that sets the routes to implement Local (username/password) authentication.
It will set the following routes:

  * Manager: `/auth/manager/local`
  * Signin: `/auth/signin/local`
  * Recover: `/auth/recover/local`
  * Register: `/auth/register/local`
  * Resume: `/auth/resume/local`

In usersStrategies:

* `field1` is used to store the username
* `field3` is used to store an encripted version of the password

While managing the passwords, if the client sends `*` as the password, the old password is retained.

@method strategyRoutesMaker
@param {Object} app Express' `app` variable, used to create routes
@param {String} strategyName The name of the strategy that needs to be setup (e.g. 'facebook')
@param {Function} done Callback
*/
exports.strategyRoutesMaker = function( app, strategyConfig, done  ){

  hotCoreStore.getAllStores( function( err, stores ){
    if( err ) return done( err );

    // ***********************
    // *** MANAGER         ***
    // ***********************

    passport.use('local-manager', new LocalStrategy({
      passReqToCallback: true,
      usernameField: 'login',
    },

    function(req, login, password, done) {

      if( ! req.session.loggedIn ) return done( new e.UnauthorizedError() );

      // Check that there isn't one already there
      stores.usersStrategies.dbLayer.selectByHash( { userId: req.session.userId, strategyId: 'local' }, { children: true }, function( err, res ){
        if( err ) return done( err, null );

        if( res.length ){
          var itsEdit = true;
          var existingPassword = res[0].field3;
          var foundStrategyId = res[0].id;
        }

        // Check if the login is already taken.
        stores.usersStrategies.dbLayer.selectByHash( { field1: login.toLowerCase() }, function( err, res ){
          if( err ) return done( err, null );

          // Check that it's not editing itself. If it IS editing itself, then it's OK to use the
          // same login (obviously!)
          var editingSelf = false;
          if( res.length > 0 ){
            editingSelf = ( itsEdit == true && res[0].id.toString() == foundStrategyId.toString()  );
          }

          if( res.length > 0 && !editingSelf ) return done( null, false, { message: "Login name taken!" } );

          // It's an edit: overwrite existing values
          if( itsEdit ){

            // If the password is a '*', then it will retain the existing password
            if( password == '*' ) password = existingPassword;

            stores.usersStrategies.dbLayer.updateById( foundStrategyId, { userId: req.session.userId, strategyId: 'local', field1: login.toLowerCase(), field3: password }, function( err, res ){
              if( err ) return done( err, null );

              var returnObject = { id: req.session.userId };
              hotplate.hotEvents.emitCollect( 'auth', 'local', 'manager', { returnObject: returnObject, userId: req.session.userId, login: login, password: password }, function( err ){
                if( err ) return done( err, null );


                return done( null, returnObject );
              });
            });

          // It's a new entry: add a new record
          } else {

            stores.usersStrategies.apiPost( { userId: req.session.userId, strategyId: 'local', field1: login.toLowerCase(), field3: password }, function( err, res ){
              if( err ) return done( err, null );

              // Allow other modules to enrich the returnObject if they like
              var returnObject = { id: res.userId };
              hotplate.hotEvents.emitCollect( 'auth', 'local', 'manager', { returnObject: returnObject, userId: res.userId, login: login, password: password }, function( err ){
                if( err ) return done( err, null );


                // That's it: return!
                return done( null, returnObject );
              });

            });
          }
        });
      });

    }
    ));

    app.post( hotplate.prefix( '/auth/manager/local/postcheck' ), function( req, res, next) {
      passport.authenticate('local-manager',  makeResponder( req, res, next, 'local', 'manager')  )(req, res, next);
    });

    // ***********************
    // *** SIGN IN         ***
    // ***********************

    passport.use('local-signin', new LocalStrategy({
      passReqToCallback: true,
      usernameField: 'login',
    },

    function(req, login, password, done) {

      if( req.session.loggedIn ) return done( new e.ForbiddenError() );

      stores.usersStrategies.dbLayer.selectByHash( { field1: login.toLowerCase(), field3: password }, function( err, res ){
        if( err ) return done( err, null );

        if( ! res.length ) return done( null, false );
  
        // Allow other modules to enrich the returnObject if they like
        var returnObject = { id: res[ 0 ].userId };
        hotplate.hotEvents.emitCollect( 'auth', 'local', 'signin', { returnObject: returnObject, userId: res[0].userId, login: login, password: password }, function( err ){
          if( err ) return done( err, null );

          req.session.loggedIn = true;
          req.session.userId = res[0].userId;
          done( null, returnObject );
        });
      });

    }
    ));

    app.post( hotplate.prefix( '/auth/signin/local/postcheck' ), function( req, res, next) {
      passport.authenticate('local-signin',  makeResponder( req, res, next, 'local', 'signin')  )(req, res, next);
    });

    // ***********************
    // *** REGISTER        ***
    // ***********************

    passport.use('local-register', new LocalStrategy({
      passReqToCallback: true,
      usernameField: 'login',
    },

    function(req, login, password, done) {

      if( req.session.loggedIn ) return done( new e.ForbiddenError() ); 

      // The profile MUST contain an ID
      if( login == '' ){
         return done( null, false, { message: "Username cannot be empty" } );
      }

      // Check that the login  isn't already there
      stores.usersStrategies.dbLayer.selectByHash( { strategyId: 'local', field1: login.toLowerCase() }, { children: true }, function( err, res ){
        if( err ) return done( err );

        if( res.length ) return done( null, false, { message: "Username taken" } );

        stores.users.dbLayer.insert( {}, function( err, user ){
          if( err ) return done( err );

          stores.usersStrategies.dbLayer.insert( { userId: user.id, strategyId: 'local', field1: login.toLowerCase(), field3: password }, function( err, res ){
            if( err ) return done( err );

            // User just registered: make her "logged in"
            req.session.loggedIn = true;
            req.session.userId = res.userId;


            // Allow other modules to enrich the returnObject if they like
            var returnObject = { id: user.id };
            hotplate.hotEvents.emitCollect( 'auth', 'local', 'register', { returnObject: returnObject, userId: user.id, login: login, password: password }, function( err ){
              if( err ) return done( err, null );

              done( null, returnObject );
            });
          });
        });
      });

    }
    ));

    app.post( hotplate.prefix( '/auth/register/local/postcheck' ), function( req, res, next) {
      passport.authenticate('local-register',  makeResponder( req, res, next, 'local', 'register')  )(req, res, next);
    });


    done( null );

  });
}
