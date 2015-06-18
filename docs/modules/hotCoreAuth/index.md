---
layout: page
---

# hotCoreAuth

This module provides authentication abilities to Hotplate, including password recovery, registration, login, credential management, and in-app resume.

This module provides authentication abilities to your application by:

* Defining authentication stores to be used in your app
* Creating authentication routes to handle authentication using Passport

This module requires sub-modules (at the moment, `local` and `facebook`) for strategy-specific functionalities.

While most of other authentication systems are based on username/password, and then allow you to associate other authentication methods to those username/password pairs (Oauth, etc.), in hotCoreAuth _each login method is the equal_. You might decide to sign up with your Facebook profile, and never bother with setting username/password or vice-versa.

# Overview

hotCoreAuth uses Passport to abstract how authentication works. Once you have configured hotCoreAuth, your application will have a fully functional authentication infrastructure that works with login/password pair as well as 2-step authentication systems (like Facebook).

Here are the terms you need to know so that you can configure it correctly for your application.

_NOTE: `hotCoreAuth` uses passport for every authentication strategy, including `local`. This is done mainly for consistency: `local` is not a two-step authentication, and it wouldn't need Passport stricky speaking._

There are five _actions_ connected to authentication:

* `signin` -- will actually login using existing credentials
* `resume` -- will resume an existing session if authentication has expired
* `register` -- will register as a new user, and automatically assign a strategy to them
* `manager` -- will assign (or delete) authentication strategies to existing users
* `recover` -- will reset credentials

There are currently two implemented strategies (although it's trivial to create more):

* `local` -- using simply a combination of login and password. The credentials will consist of a login/password pair
* `facebook` -- using Facebook's authentication scheme. The credentials will consist of the Facebook user ID

hotCoreAuth will use submodules to create authentication URLs for the corresponding strategy; for example for `facebook`, the `facebook` module it will create:

* GET `/auth/signin/facebook`
* GET `/auth/register/facebook`
* GET `/auth/recover/facebook`
* GET `/auth/manager/facebook`
* GET `/auth/resume/facebook`

For the `local` strategy, the `local` module will create:

* POST `/auth/signin/local`
* POST `/auth/register/local`
* POST `/auth/recover/local`
* POST `/auth/manager/local`
* POST `/auth/resume/local`

These URLs are the ones clients will have to use to complete the required action. Note that while some URLs will require a payload (for example, `local` will require `login` and `password` in their POST payload), others will deal with authentication without any data (users will be redirected to Facebook's login screen).

This document details the specifications of these [routes](#docs-routes).

In hotCoreAuth, the _operation_ that is about to be performed is defined by the pair _strategy-action_ (for example `local-signin`, or `facebook-recover`, etc.).

The response from the server will depend on the _response type_, which is decided by the client by setting a cookie named after the operation's name (for example `XXXX-signin`, `XXXX-recover`, `XXXX-register`, `XXXX-resume`, `XXXX-manager`, where `XXXX` can be `facebook`, `local`, or any other authentication strategy). For example:

* an ajax-based login screen based on local login will have something like this in code: `cookie( 'local-signin', 'ajax', { path: '/' } );`;

* a Facebook-based login screen will likely open a new window on `/auth/signin/facebook` to autenticate, and will want 1) that new window closed by the end of the authenticaton process 2) the parent window redirected to the application; so, it will have something like this in the code: `cookie( 'facebook-signin', 'redirect-opener', { path: '/' } );`;

* a simpler Facebook-based login screen might not open a new window, and simply hop to the Faceook authentication page on `/auth/signin/facebook` to autenticate. In this case, the screen will want to know that after authentication the application will be redirected to the main application's URL; so, it will have something like this in the code: `cookie( 'facebook-signin', 'redirect', { path: '/' } );`;

The response type will depend on how the login screen wants to happen once logging in is done.

Here is a list of possible _response types_ (corresponding to the cookie's value):

* `content` -- The function returned by `hotCoreAuth.contentResponsePage` is run with parameters `strategyId, action, user, profile`, and the result is then served to the client. The (redefinable) stock function will simply display an HTML page with the word "RESPONSE" in it; the page will close (thanks to a Javascript timer) after 5 seconds. If you use this response type, you ought to redefine `hotCoreAuth.contentResponsePage` to something more meaningful. This response type is useful when you want to create a very customized response page following your login.

* `close` -- The function returned by `hotCoreAuth.closeResponsePage` is run with parameters `strategyId, action, user, profile`, and the result is then served to the client. The (redefinable) stock function will work like this: if `user` is set (login successful): the window is closed immediately. If `user` isn't set and `profile` has a `message` attribute, the message is displayed with a Javascript `alert()` and the window is then closed. This response type is useful when you are already logged in, and are adding a new strategy to an existing user.

* `ajax` -- If `user` is set, it returns a page with status 200, and -- as contents -- a JSON string like so: `{ user: user, profile: profile }`.  If `user` isn't set, it returns a page with status `403` and a JSON string like so: `{ message: error }` NOTE: Setting `ajax` as a response type only makes sense for local authentication, since the ajax information will be returned after a redirect, which will basically result in an HTML page containing successful or unsuccesful JSON data. This response type is useful to the login/password strategy, that can have a response straight away.

* `redirect-opener` -- The function returned by `hotCoreAuth.redirectOpenerResponsePage` is run with parameters `strategyId, action, user, profile`, and the result is then served to the client. The (redefinable) stock function will work like this: if the user isn't set (login failed) and `profile.message` is set, it will display `profile.message` in a Javascript alert coming from the opener; otherwise (login is successful), it will redirect the opener window by setting its location to  hotCoreAuth.redirectURLs.success['action']. In any case, the current window will be closed. This response type is useful when a login page opens the authentication URL in a new window, and wants the opening window to be redirected to the application after authentication.
* `redirect` -- If `user` is set, the current window redirected to the URL set as `hotCoreAuth.redirectURLs.success['action']`. If `user` isn't set, `req.session.messages` is pushed `{ type: 'error', message: profile.message }` and  the window is redirected to `hotCoreAuth.redirectURLs.fail['action']`. Note that the new page will have access to the message via the session. This response type is useful when a login page is simply a link to the authentication URL and wants to redirect to the application after authentication.

hotCoreAuth provide three stores that will hold the authentication data:

* `authStrategies` A pseudo-store, basically containing the keys of the configuration object `hotCoreAuth.strategies`. It implements `get` and `getQuery`.

* `users`. A simple store that contain just the IDs of the created users. _There is no username associated to a user!_ A user is just an abstract entry: what really matters the the ID.

* `usersStrategies`. The list of strategies associated to a specific user. Basically, it defines how a user can actually login. It implements `get`, `getQuery` and `delete`; the store has a public URL so that existing users to change how they are allowed to login. Each record contains the strategyId and four fields, which will contain strategy information. For example the strategy `facebook` will have the Facebook's userId as `field1`, whereas the `local` strategy will have the user's login name in `field1` and the user's password in `field3`. Note that `field3` and `field4` are considered 'protected' (which imply that they will not be returned by REST queries).

This document details the specifications of these [stores](#docs-stores).

# Configuration

Once you are familiar with the concepts explained above, configuration of `hotCoreAuth` is very straightforward.

    hotplate.config.set('hotCoreAuth', {

      callbackURLBase: 'http://localhost:3000',

      recoverURLexpiry: 60*30, // Seconds for which the recover URL works for

      // Only local strategy enabled by default
      strategies: {
        local: { },
      },

      redirectURLs: {
        success: {
          signin: hotplate.prefix( '/auth/pick' ),
          recover: hotplate.prefix( '/auth/pick' ),
          register: hotplate.prefix( '/auth/pick' ),
          manager: hotplate.prefix( '/' ),
        },

        fail: {
          signin: hotplate.prefix( '/auth/welcome' ),
          recover: hotplate.prefix( '/auth/welcome' ),
          register: hotplate.prefix(  '/auth/welcome' ),
          manager: hotplate.prefix( '/' ),
        }
      },
      contentResponsePage: basicContentResponsePage,
      closeResponsePage: basicCloseResponsePage,
      redirectOpenerResponsePage: basicRedirectOpenerResponsePage,
    });

Here is an explanation of each option:

* `callbackURLBase`. It's the host/port parts of the URL used as prefix for Oauth callbacks.
This should be changed to your server's IP in production

* `recoverURLexpiry`. The number of seconds the recover URL will work for

* `strategies`. The login strategies. By default, it's just `local` (which doesn't need parameters).
In your application you might have:

    hotplate.config.set('hotCoreAuth.strategies', {
      facebook: {
        clientID: 'XXXXXXXXXXXXXXXXXX',
        clientSecret: 'YYYYYYYYYYYYYYYYYYYYYY',
      },
      local: {
      },

* `redirectURLs`. These URLs are used by makeResponder for the redirect and redirect-opener actions as well as /recover/:recoverToken (which will redirect to `hotCoreAuth.redirectURLs.success.recover`). Note that `hotplate.routeUrlsPrefix` prefixes are honoured thanks to the prefix() call (as they should).

* `contentResponsePage`. The function that will generate the page content in case the response type is set as `content`. Note that a basic `basicContentResponsePage` function is set as default and can be used as a template.

* `closeResponsePage`. The function that will generate the page responsible of closing the current window in case the response type is `close`. Note that a basic `basicCloseResponsePage` function is set as default and can be used as a template.

* `redirectOpenerResponsePage`. The function that will generate the page responsible of redirecting the opener to the appropriate URL. Note that a basic `BasicRedirectOpenerResponsePage` function is set as default and can be used as a template

The signature for `contentResponsePage`, `closeResponsePage` and `redirectResponsePage` is the same: `steategyId`, `action`, `user`, `profile`. For example you might write:

    hotplate.config.set('hotCoreAuth.contentResponsePage' ) = function( strategyId, action, user, profile ){
        ...
        return 'some response that will be sent over';
      }

If `user` is `false`, authentication failed. Note that they don't have access to `res`: they simply return the page that will be returned to the client. The string can be generated in whichever way.


# How hotCoreAuth works

Writing extra strategies for hotCoreAuth requires you to know some of its internals.

When it's run, `hotCoreAuth` will scan the configuration object `hotCoreAuth.strategies`, an object where each key is a strategy name. The value associated to the key will be its configuraton. For example:

    facebook: {
      clientID: 'XXXXXXXXXXXX',
      clientSecret: 'XXXXXXXXXX',
    }

Where `clientID` and `clientSecret` are provided by Facebook: to get them you will need to go to the [Developers](https://developers.facebook.com/) section of Facebook, and click on My `Apps > Add a new app`. The created app will have the required _App ID_ and _App Secret_ you need to fill in these fields;

There are two moments when strategies use their stragegy-specific plugins: during the event `setRoutes` and during the event `stores`.

### Extra routes defined by sub-modules

In `setRoutes`, hotCoreAuth will set its own URLs (that is, the recover URL) and will then cyclically `require()` _all_ modules defined in `hotCoreAuth.strategies`, appending `.js` to the strategy's name; for example the module `auth/facebook.js` will be loaded, and the `strategyRoutesMaker` attribute of the module will be called (since it's actually a function reponsible of creating the appropriate routes for the `facebook` strategy). `strategyRoutesMaker()` has the following signature:

    strategyRoutesMaker( app, strategyName, function( err ) { } );

In case of Facebook, the routes created are:

* Manager: `GET /auth/manager/facebook`, `/auth/manager/facebook/callback`
* Signin: `GET /auth/signin/facebook`, `/auth/manager/signin/callback`
* Recover: `GET /auth/recover/facebook`, `/auth/manager/recover/callback`
* Register: `GET /auth/register/facebook`, `/auth/manager/register/callback`
* Resume: `GET /auth/resume/facebook`, `/auth/manager/resume/callback`

They do not need any parameters, as authentication will be fully handled by Facebook.

### Extra stores defined by sub-modules



## hotCoreAuth's routes and Passport

The authentication routes are all managed by Passport, "the" powerful authentication module for Node.js.

Here is what happens for Facebook.

For `signin`, `facebook.js` will first define a `named strategy` called `facebook-signin`, as well as define two routes:

    // STRATEGY DEFINITION
    strategyConfig = hotplate.config.get( 'hotCoreAuth.strategies.facebook' );
    passport.use( 'facebook-signin', new FacebookStrategy({
      clientID: strategyConfig.clientID,
      clientSecret: strategyConfig.clientSecret,
      callbackURL: callbackURLBase + hotplate.prefix( "/auth/signin/facebook/callback" ),
      passReqToCallback: true,
    },

    // This will check if `profile` is registered and therefore allowed to login
    function customAuthentication( req, accessToken, refreshToken, profile, done ) {
      // ...
      // This function will return either
      done( null, false, { message: "Facebook didn't return a profile ID, procedure aborted" } );
      // Or:
      done( null, false, { message: "Your Facebook user is not registered" } );
      // or:
      done( null, user, profile  );
    }
    ));

    // FIRST ROUTE
    app.get('/auth/signin/facebook', passport.authenticate('facebook-signin'));

    // SECOND ROUTE
    app.get('/auth/signin/facebook/callback', function( req, res, next) {
      passport.authenticate('facebook-signin',  makeResponder( req, res, next, 'facebook', 'signin')  )(req, res, next);
    });

Here is the breakdown of what happens.

### The strategy definition

    // STRATEGY DEFINITION
    strategyConfig = hotplate.config.get( 'hotCoreAuth.strategies.facebook' );
    passport.use( 'facebook-signin', new FacebookStrategy({
      clientID: strategyConfig.clientID,
      clientSecret: strategyConfig.clientSecret,
      callbackURL: callbackURLBase + hotplate.prefix( "/auth/signin/facebook/callback" ),
      passReqToCallback: true,
    },
    // This will check if `profile` is registered and therefore allowed to login
    function customAuthentication( req, accessToken, refreshToken, profile, done ) {
      // ...
      // This function will return either
      done( null, false, { message: "Facebook didn't return a profile ID, procedure aborted" } );
      // Or:
      done( null, false, { message: "Your Facebook user is not registered" } );
      // or:
      done( null, user, profile  );
    }
    ));

With this code you are registering a named strategy called `facebook-signin` with a bunch of facebook-specific parameters (`clientID`, `clientSecret`, etc.) and -- most importantly -- a callback used to check whether the `profile` returned by Facebook is actually allowed to sign in. This callback is called with the parameters `req`, `accessToken`, `refreshToken`, `profile`, `done`, and will need to call `done()` with the following parameters:

* `err` -- as usual in node
* `user` -- if authentication was successful, the simple Hotplate user object; if it didn't, 'false'
* `info` -- if authentication was successful ( that is, `user !== false`), the Facebook profile information; if it didn't, an object with a `message` attribute: `{ message: 'The authentication problem' }`.

### The first route

````
    // FIRST ROUTE
    app.get('/auth/signin/facebook', passport.authenticate('facebook-signin'));
````

This route is managed completely by Passport ( `passport.authenticate('facebook-signin')` returns a valid Express route). This route, which will generally be opened in a new window in your client application, will redirect to facebook.com, passing on the `clientID`, `clientSecret` and `callbackURL`. At the end of the process, Facebook will then always redirect the user's browser to `/auth/signin/facebook/callback` (the callback URL provided earlier to Facebook), passing along information relevant to authentication: namely whether it worked or not, and -- if it did work -- the profile information. This route is -- needless to say -- managed directly by Passport via the second route definition:

### The second route

    // SECOND ROUTE
    app.get('/auth/signin/facebook/callback', function( req, res, next) {
      passport.authenticate('facebook-signin',  makeResponder( req, res, next, 'facebook', 'signin')  )(req, res, next);
    });

This is when passport calls the authentication callback defined earlier, with the parameters `req, accessToken, refreshToken, profile, done`.  If `profile` isn't defined, then it means that Facebook authentication failed. If `profile` is set, then authentication in Facebook did work. Keep in mind that a successful Facebook login doesn't mean that that Facebook profile is allowed to signin into your application; it also means that _Facebook_ has verified that the user has valid Facebook credentials. There are certaintly many valid Facebook users who do not have a corresponding user in your application.

The scoping of this function can be a little confusing. A little simplification would make it read like so:

    app.get('/auth/signin/facebook/callback', function( req, res, next) {
      passport.authenticate('facebook-signin',  function responder( err, user, profile ){ ... }  )(req, res, next);
    });

Where:

* `passport.authenticate()` returns an Express style route function that accepts as parameters the usual triplet `(req, res, next)`. For all intents and purposes, the second line could well read `passport.authenticate( req, res, next, 'facebook-signin',  function responder( err, user, profile ){ ... } );``
*  passport.authenticate() will call the custom authentication function with the parameters`req, accessToken, refreshToken, profile, done`. The custom authentication function will be responsible of calling `done( err, user, profile )`: if the Facebook user is not allowed, it will call `done()`  with `user` being `false`;  if the Facebook user is allowed, it will call `done()` with `user` being the user record, and `profile` being the Facebook profile. If successful, the custom authentication functon will also set `req.session.loggedIn` and `req.session.userId` (the default session variables for Hotplate)
* As you have probably guessed, when `password.authenticate()` calls `done()`, will actually call the `responder( err, user, profile )` which has access to everything: `req`, `res`, `next`, `user`, `profile`.
* In hotCoreAuth, the responder is actually generated by the function `makeResponder()`, which will respond with `res.send()` in accordance with the cookie set by the client, following hotCoreAuth specifications.

## Writing your own strategy

To write your own strategy, take `facebook` as a starting point and change it so that it uses the right Passport backend.

Use the information in this section of the module's manual to get the module right. It's not essential to know _everything_ I covered, but it will certainly help you understand the code you write.

# Events {#docs-events}

## [stores](/docs/events#docs-stores) {#docs-stores}

The stores returned by this module are:

### `authStrategies` {#docs-stores-authstrategies}

The strategies available. This store is a pseudo-store (it doesn't rely on data stored in a database, and it's inherited from `JsonRestStores`+`JsonRestStores.HTTPMixin`). Its data is the keys of the configuration object `hotCoreAuth.strategies`, which is the data returned by the methods `get` and `getQuery`.

    var AuthStrategies = declare( JsonRestStores, JsonRestStores.HTTPMixin, {

      schema: new SimpleSchema({
        id:        { type: 'blob', isRequired: true, trim: 30 }  ,
      }),

      handleGet: true,
      handleGetQuery: true,

      storeName:  'authStrategies',

      publicURL: '/authstrategies/:id',
      hotExpose: true,

      // Fetch one strategy (if it's defined in hotCoreAuth.strategies)
      implementFetchOne: function( request, cb ){ },

      // Return the strategies, depending on `hotCoreAuth.strategies`'s keys
      implementQuery: function( request, cb ){ },
    });

    stores.authStrategies = new AuthStrategies();

### `users` {#docs-stores-users}

The list of users. Note that only very little information is stored about the user itself: this table only stores the `id`, the `recoverToken` and the `recoverTokenCreated` fields. It is not exposed to the client application at all: it's only created to be accessible via API within Hotplate itself.

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

### `usersStrategies` {#docs-stores-usersstrategies}

This store contains the list of strategies associated to a specific user. It's there so that users are able to delete unwanted strategies. Note that strategies are only ever added by the specific strategy layers (like `facebook` or `local`).

It implements `get`, `getQuery` and `delete`, and it only allows querying to the record owner (`session.userId` needs to match the query string's `userId`, or it will return Unauthorized). It also doesn't allow a user to delete their last remaining strategy (otherwise they won't be allowed to log back in, nor to recover their access).

Note that `field3` and `field4` are used by hotCoreAuth to store sensitive information, as they are never returned by the store.

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

      // Users are only allowed to use `delete`, `get` and `getQuery` on their own strategies
      // Also, users are not allowed to `delete` a strategy if it's the last one remaining
      checkPermissions: function( request, method, cb ){ ... },

      // The field `field3` and `field4` are taken out of the equation, as they are "secret"
      extrapolateDoc: function( request, method, doc, cb ){ ... }
    });
    stores.usersStrategies = new UsersStrategies();

## [routes](/docs/events#docs-routes) {#docs-routes}


### GET /recover/:recoverToken

The URL that will validate recovery validation.

When a users completes the `recover` action (which might imply giving their user name, or verifying themselves via Facebook), the strategy plugin will actually creare a secret `recoveryToken` hash, and will associate it to the user's record, and will emit a node event `hotCoreAuth/recover` (fire-and-forget); when that event is fired, the application will generally intercept it and send an email (or an SMS, or smoke signals) to the user with the "recovery URL".

_TODO: event is not fired yet. Still need to test procedure. Will do when "user invite" is done._

The "recovery URL" contains the `recoveryToken`: this route will check the database looking for a user with a matching `recoverToken` in the `users` table: if found, the user will be set as logged in and the user will be redirected to `hotCoreAuth.redirectURLs.success.recover`.

### URLs created by `hotCoreAuth/facebook`

The plugin `hotCoreAuth/facebook` will create the following routes:

### URLs created by `hotCoreAuth/local`
