---
layout: page
---

# hotCoreAuth

<!-- START doctoc -->
<!-- END doctoc -->

# Introduction

This module provides authentication abilities to Hotplate, including password recovery, registration, login, credential management, and in-app resuming.

This module provides authentication abilities to your application by:

* Defining authentication stores to be used in your app
* Creating authentication routes to handle authentication using Passport

This module requires sub-modules (at the moment, `local` and `facebook`) for strategy-specific functionalities.

While most of other authentication systems are based on username/password, and then allow you to associate "extra" authentication methods to those username/password pairs (Oauth, etc.), in hotCoreAuth _each login method is the equal_. The user record only has the user's ID. You might decide to sign up with your Facebook profile, and never bother with setting username/password or vice-versa.

# Overview

hotCoreAuth uses Passport to abstract how authentication works. Once you have configured hotCoreAuth, your application will have a fully functional authentication infrastructure that works with login/password pair as well as 2-step authentication systems (like Facebook).

hotCoreAut is powerful enough that can be in itself a good enough reason to use Hotplate.

Here are the terms you need to know so that you can configure it correctly for your application.

_NOTE: `hotCoreAuth` uses passport for every authentication strategy, including `local`. This is done mainly for consistency: `local` is not a two-step authentication, and it wouldn't need Passport stricky speaking._

There are five _actions_ connected to authentication:

* `signin` -- will actually login using existing credentials
* `resume` -- will resume an existing session if authentication has expired
* `register` -- will register as a new user, and automatically assign a strategy to them
* `manager` -- will assign authentication strategies to existing users
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

These URLs are the ones clients will have to use to complete the required action. Note that while some URLs will require a payload (for example, `local` will require `login` and `password` in their POST payload), others will deal with authentication without any data (users will be redirected to Facebook's login screen). The [routes](#docs-routes) section explains in detail what routes are created and how to interact with them.

These routes are the only way to add an authentication strategy to a user via REST calls.

In hotCoreAuth, the _operation_ that is about to be performed is defined by the pair _strategy-action_ (for example `local-signin`, or `facebook-recover`, etc.).

The response from the server will depend on the _response type_, which is decided by the client by setting a cookie named after the operation's name (for example `XXXX-signin`, `XXXX-recover`, `XXXX-register`, `XXXX-resume`, `XXXX-manager`, where `XXXX` can be `facebook`, `local`, or any other authentication strategy). For example:

* an ajax-based login screen based on local login will have something like this in code: `cookie( 'local-signin', 'ajax', { path: '/' } );`;

* a Facebook-based login screen will likely open a new window on `/auth/signin/facebook` to autenticate, and will want 1) that new window closed by the end of the authenticaton process 2) the parent window redirected to the application; so, it will have something like this in the code: `cookie( 'facebook-signin', 'redirect-opener', { path: '/' } );`;

* a simpler Facebook-based login screen might not open a new window, and simply hop to the Faceook authentication page on `/auth/signin/facebook` to autenticate. In this case, the screen will want to know that after authentication the application will be redirected to the main application's URL; so, it will have something like this in the code: `cookie( 'facebook-signin', 'redirect', { path: '/' } );`;

The response type will depend on how the login screen wants to happen.

Here is a list of possible _response types_ (corresponding to the cookie's value):

* `content` -- The function returned by `hotCoreAuth.contentResponsePage` is run with parameters `strategyId, action, user, profile`, and the result is then served to the client. The (redefinable) stock function will simply display an HTML page with the word "RESPONSE" in it; the page will close (thanks to a Javascript timer) after 5 seconds. If you use this response type, you ought to redefine `hotCoreAuth.contentResponsePage` to something more meaningful. This response type is useful when you want to create a very customized response page following your login.

* `close` -- The function returned by `hotCoreAuth.closeResponsePage` is run with parameters `strategyId, action, user, profile`, and the result is then served to the client. The (redefinable) stock function will work like this: if `user` is set (login successful): the window is closed immediately. If `user` isn't set and `profile` has a `message` attribute, the message is displayed with a Javascript `alert()` and the window is then closed. This response type is useful when you are already logged in, and are adding a new strategy to an existing user.

* `ajax` -- If `user` is set, it returns a page with status 200, and -- as contents -- a JSON string like so: `{ user: user, profile: profile }`.  If `user` isn't set, it returns a page with status `403` and a JSON string like so: `{ message: error }` NOTE: Setting `ajax` as a response type only makes sense for local authentication, since the ajax information will be returned after a redirect, which will basically result in an HTML page containing successful or unsuccesful JSON data. This response type is useful to the login/password strategy, that can have a response straight away.

* `redirect-opener` -- The function returned by `hotCoreAuth.redirectOpenerResponsePage` is run with parameters `strategyId, action, user, profile`, and the result is then served to the client. The (redefinable) stock function will work like this: if the user isn't set (login failed) and `profile.message` is set, it will display `profile.message` in a Javascript alert coming from the opener; otherwise (login is successful), it will redirect the opener window by setting its location to  hotCoreAuth.redirectURLs.success['action']. In any case, the current window will be closed. This response type is useful when a login page opens the authentication URL in a new window, and wants the opening window to be redirected to the application after authentication.

* `redirect` -- If `user` is set, the current window redirected to the URL set as `hotCoreAuth.redirectURLs.success['action']`. If `user` isn't set, `req.session.messages` is pushed `{ type: 'error', message: profile.message }` and  the window is redirected to `hotCoreAuth.redirectURLs.fail['action']`. Note that the new page will have access to the message via the session. This response type is useful when a login page is simply a link to the authentication URL and wants to redirect to the application after authentication.

You can see the signatures of the `responsePage` functions in the [configuration section](#configuration) of this document.

hotCoreAuth provide three stores that will hold the authentication data:

* `authStrategies` A pseudo-store, basically containing the keys of the configuration object `hotCoreAuth.strategies`. It implements `get` and `getQuery`.

* `users`. A simple store that contain just the IDs of the created users. _There is no username associated to a user!_ A user is just an abstract entry: what really matters is the user ID.

* `usersStrategies`. The list of strategies associated to a specific user. Basically, it defines how a user can actually login. It implements `get`, `getQuery` and `delete`; the store has a public URL so that existing users can see how they are allowed to login, and delete a strategy if they wish. Each record contains the strategyId and four fields, which will contain strategy login information. For example the strategy `facebook` will have the Facebook's userId as `field1`, whereas the `local` strategy will have the user's login name in `field1` and the user's password in `field3`. Note that `field3` and `field4` are considered 'protected' (which imply that they will not be returned by REST queries).

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
This should be changed to your server's IP in production. This is necessary because 2-way authentication methods always end up redirecting to a specific URL.

* `recoverURLexpiry`. The number of seconds the recover URL will work for

* `strategies`. The login strategies available to your application. By default, it's just `local` (which doesn't need parameters). In your application you might have:

````
    hotplate.config.set('hotCoreAuth.strategies', {
      facebook: {
        clientID: 'XXXXXXXXXXXXXXXXXX',
        clientSecret: 'YYYYYYYYYYYYYYYYYYYYYY',
      },
      local: {
      },
````

* `redirectURLs`. These URLs are used for the redirect and redirect-opener actions as well as `/recover/:recoverToken` (which will redirect to `hotCoreAuth.redirectURLs.success.recover`). Note that `hotplate.routeUrlsPrefix` prefixes are honoured thanks to the `hotplate.prefix()` call (as they should).

* `contentResponsePage`. The function that will generate the page content in case the response type is set as `content`. Note that a basic `basicContentResponsePage` function is set as default and can be used as a template.

* `closeResponsePage`. The function that will generate the page responsible of closing the current window in case the response type is `close`. Note that a basic `basicCloseResponsePage` function is set as default and can be used as a template.

* `redirectOpenerResponsePage`. The function that will generate the page responsible of redirecting the opener to the appropriate URL. Note that a basic `BasicRedirectOpenerResponsePage` function is set as default and can be used as a template

The signature for `contentResponsePage`, `closeResponsePage` and `redirectResponsePage` is the same: `function( strategyId, action, user, profile)`. For example you might write:

    hotplate.config.set('hotCoreAuth.contentResponsePage' ) = function( strategyId, action, user, profile ){
        ...
        return 'some response that will be sent over';
      }

If `user` is `false`, authentication failed. Note that these functions don't have access to `res`: they simply return the page that will be returned to the client.

# Writing plugins for extra strategies

Writing plugins for extra strategies requires you to know some of hotCoreAuth internals.

When it's run, `hotCoreAuth` will scan the configuration object `hotCoreAuth.strategies`, an object where each key is a strategy name. The value associated to the key will be its configuraton. For example:

    facebook: {
      clientID: 'XXXXXXXXXXXX',
      clientSecret: 'XXXXXXXXXX',
    }

Where `clientID` and `clientSecret` are provided by Facebook: to get them you will need to go to the [Developers](https://developers.facebook.com/) section of Facebook, and click on My `Apps > Add a new app`. The created app will have the required _App ID_ and _App Secret_ you need to fill in these fields;

There are two moments when strategies use their stragegy-specific plugins: during the event `setRoutes` and during the event `stores`.

### Extra routes defined by sub-modules

In Hotplate, a module defines routes by responding to the event `setRoutes`. However, the routes set by hotCoreAuth depend on the strategy plugins you have enabled. Strategy plugins export a function, `strategyRoutesMaker()`, which will be responsible of creating the necessary extra routes for that particular strategy.

When responding to `setRoutes`, hotCoreAuth will first set its own URLs (that is, the recover URL) and will then cyclically `require()` _all_ modules defined in `hotCoreAuth.strategies`, appending `.js` to the strategy's name; for example the module `auth/facebook.js` will be loaded, and the `strategyRoutesMaker` attribute of the module will be called (since it's actually a function reponsible of creating the appropriate routes for the `facebook` strategy). `strategyRoutesMaker()` has the following signature:

    strategyRoutesMaker( app, strategyName, function( err ) { } );

In case of Facebook, the routes created are:

* Manager: `GET /auth/manager/facebook`, `/auth/manager/facebook/callback`
* Signin: `GET /auth/signin/facebook`, `/auth/manager/signin/callback`
* Recover: `GET /auth/recover/facebook`, `/auth/manager/recover/callback`
* Register: `GET /auth/register/facebook`, `/auth/manager/register/callback`
* Resume: `GET /auth/resume/facebook`, `/auth/manager/resume/callback`

They do not need any parameters, as authentication will be fully handled by Facebook.

### Extra stores defined by sub-modules

In Hotplate, a module defines stores by responding to the event `stores`. However, the stores set by hotCoreAuth depend on the strategy plugins you have enabled. Strategy plugins export a function, `extraStores()`, which will be responsible of creating the necessary extra stores for that particular strategy.

When responding to `stores`, hotCoreAuth will first set its own URLs (that is, `authStrategies`, `users`, `usersStrategies`) and will then cyclically `require()` _all_ modules defined in `hotCoreAuth.strategies`, appending `.js` to the strategy's name; for example the module `auth/local.js` will be loaded, and the `extraStores` attribute of the module will be called (since it's actually a function reponsible of creating the appropriate stores for the `local` strategy). `extraStores()` has the following signature:

    strategyRoutesMaker( stores, function( err ) { } );

In case of `local`, the extra store `logins` is created: that's a read-only store that will allow users to check if a user name is already taken.

## hotCoreAuth's routes with Passport

The authentication routes are all managed by Passport, "the" powerful authentication module for Node.js.

Here is what happens for Facebook.

For `signin`, `facebook.js` will first define a `named strategy` called `facebook-signin`, as well as define two routes. Here is the full (but redacted for brevity) source code:

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

If successful, the custom authentication functon will also set `req.session.loggedIn` and `req.session.userId` (the default session variables for Hotplate)

### The first route

````
    // FIRST ROUTE
    app.get('/auth/signin/facebook', passport.authenticate('facebook-signin'));
````

This route is managed completely by Passport (`passport.authenticate('facebook-signin')` returns a valid Express route function). This route, which will generally be opened in a new window in your client application, will redirect to facebook.com, passing on the `clientID`, `clientSecret` and `callbackURL`. At the end of the process, Facebook will then always redirect the user's browser to `/auth/signin/facebook/callback` (the callback URL provided earlier to Facebook), passing along information relevant to authentication: namely whether it worked or not, and -- if it did work -- the profile information. This secound route is -- needless to say -- managed directly by Passport via the second route definition:

### The second route

    // SECOND ROUTE
    app.get('/auth/signin/facebook/callback', function( req, res, next) {
      passport.authenticate('facebook-signin',  makeResponder( req, res, next, 'facebook', 'signin')  )(req, res, next);
    });

The scoping of this function can be a little confusing. A little simplification would make it read like so (since `makeResponder()` returns a function):

    app.get('/auth/signin/facebook/callback', function( req, res, next) {
      passport.authenticate('facebook-signin',  function responder( err, user, profile ){ ... }  )(req, res, next);
    });

Considering that `passport.authenticate()` returns a function with the same signature (`req, res, next`), and it's returning a function only so that Passport is framework-agnostic, for all intents and purposes, the second line could well read `passport.authenticate( req, res, next, 'facebook-signin',  function responder( err, user, profile ){ ... } );`.

So, it could be read as:

    app.get('/auth/signin/facebook/callback', function( req, res, next) {
      passport.authenticate(req, res, next, 'facebook-signin',  function responder( err, user, profile ){
        ...
      });
    });

That's much more readable.

Since `passport.authenticate()` has access to `req` and `res`, it has access to all of the information that came from Facebook (the `accessToken` and the `refreshToken`). So, `passport.authenticate()` is able to call the strategy authentication callback defined earlier, passing it the parameters `req, accessToken, refreshToken, profile, done`.  Using this callback, `passport.authenticate()` is able to know if authentication was successful or not (it will receive back `user` and `profile` from the calllback). At this point, `passport.authenticate()` will call the responder with the right parameters `user` and `profile`.

Note that in hotCoreAuth, the responder is actually generated by the function `makeResponder()`, which will respond with `res.send()` in accordance with the cookie set by the client, following hotCoreAuth specifications.

## Writing your own strategy

To write your own strategy, take `facebook` as a starting point and change it so that it uses the right Passport backend. It's only 300 lines of code, most of which you will be able to reuse.

Use the information in this section of the module's manual to get the module right. It's not essential to know _everything_ I covered, but it will certainly help you understand the code you write.

# Events {#docs-events}

## [pageElements](/docs/events#docs-pageElements) {#docs-pageElements}

This event is used to make sure that each page defines the following Javascript variables:

* `strategyIds` -- the available strategy IDs managed by the server. Taken from  `Object.keys( hotplate.config.get('hotCoreAuth.strategies')`
* `successURLs` -- the URLs to use in case of success. Taken from `hotplate.config.get('hotCoreAuth.redirectURLs.success')`.
* `failURLs` -- the URLs to use in case of success. Taken from `hotplate.config.get('hotCoreAuth.redirectURLs.success')`.

## [pageElementsPerPage](/docs/events#docs-pageElements) {#docs-pageElements}

This event is used to make sure that if req.userId is set, then rendered pages will have:

* `userId` -- The userId taken from `req.session.userId`

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

### Stores created by `hotCoreAuth/local`

#### `logins` {#docs-stores-usersstrategies}

The strategies available. This store retis a pseudo-store (it doesn't rely on data stored in a database, and it's inherited from `JsonRestStores`+`JsonRestStores.HTTPMixin`). THe store takes its data from the [userStrategies](#docs-stores-usersstrategies) store: the list of logins are the records where `strategyId` is `local`, and the login names are stores in `field1`).

Here is the definition:

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
        // return records from the `usersStrategies` store, filtering by `strategyId`
        // (needs to be `local`) and `field` (needs to match the `login` passed)
      },

    });
    stores.login = new Logins();

As you can see, the store only implements `handleGetQuery`, and in a very limited way. Note that `queryConditions` is defined, but it's only there to let clients know how querying works.

## [routes](/docs/events#docs-routes) {#docs-routes}


### `GET /recover/:recoverToken`

The URL that will validate recovery validation.

When a users completes the `recover` action (which might imply giving their user name, or verifying themselves via Facebook), the strategy plugin will actually creare a secret `recoveryToken` hash, and will associate it to the user's record, and will emit a node event `hotCoreAuth/recover` (fire-and-forget); when that event is fired, the application will generally intercept it and send an email (or an SMS, or smoke signals) to the user with the "recovery URL".

_TODO: event is not fired yet. Still need to test procedure. Will do when "user invite" is done._

The "recovery URL" contains the `recoveryToken`: this route will check the database looking for a user with a matching `recoverToken` in the `users` table: if found, the user will be set as logged in and the user will be redirected to `hotCoreAuth.redirectURLs.success.recover`.

### routes created by `hotCoreAuth/auth/facebook.js`

The plugin `hotCoreAuth/facebook` will create the following "public" routes:

* Manager: GET `/auth/manager/facebook`
* Signin: GET `/auth/signin/facebook`
* Recover: GET `/auth/recover/facebook`
* Register: GET `/auth/register/facebook`
* Resume: GET `/auth/resume/facebook`

These routes do not take any paramters. Your application should either just point there (in which case the `redirect` response type is recommended), or open a new window with them (usually using the `redirect-opener` response type).

It will also create the following "redirect" routes (not to be used directly by the application):

* Manager: GET `/auth/manager/facebook/callback`
* Signin: GET `/auth/signin/facebook.callback`
* Recover: GET `/auth/recover/callback/facebook`
* Register: GET `/auth/register/facebook/callback`
* Resume: GET `/auth/resume/facebook/callback`

All of these routes will always:

1. Redirect to Facebook, which will display the user a login/password screen.
1. Operate on the database and manipulate the session variable if needed
1. Return the information to the user; the response will depend on the _response type_ cookie set by the login form as well as the _ResponsePage_ functions set by the user.

The difference in these routes is in what they do in the second step. Here is the detail.

#### `GET /auth/manager/facebook`

This route will only work if the user is already logged in (checked via the session variable `req.session.loggedIn`) since it's meant to be used to _add_ a new strategy to a logged in user.

In case of successful Facebook login, it will check whether `facebook` is already a login strategy associated to the user. If the user doesn't yet have a `facebook` strategy associated to her, it will associate the Facebook profile ID with the user by adding a record to the store `usersStrategies`.

This operation will fail if either the user already has a `facebook` strategy associated to her, or if that Facebook ID is already associated to a different account.

_Note_: the new strategy is added via a REST API call, like so: `usersStrategies.apiPost( { userId: req.session.userId, strategyId: 'facebook', field1: profile.id }` so that any notification mechanism (via comet) to existing users is actually triggered (e.g. the interface will be able to know that `login` is now a viable strategy).

The Facebook ID is stored in `field1` in the `userStrategies` store.

#### `GET /auth/signin/facebook`

This route will only work if the user is _not_ logged in (checked via the session variable `req.session.loggedIn`) since it's meant to be used to actually login.

In case of successful Facebook login, it will set `req.session.loggedIn` and `req.session.userId`. A 'successful login' here means that there is a record in `usersStrategies` where `strategyId` is `facebook`, and `field1` corresponds to the acquired Facebook ID.

#### `GET /auth/recover/facebook`

This route will only work if the user is _not_ logged in (checked via the session variable `req.session.loggedIn`) since it's meant to be used to recover access to the application.

In case of successful Facebook login, it will update the `users` table setting the fields `user.recoverToken` and `user.recoverTokenCreated`.

The token will then be used by the route `/recover/:recoverToken` to let the user back in.

When recovering, the signal XXXXXXXX (TODO: decide name and emit it!) is emitted, to notify the application which will, in turn, be responsible of sending the user the secret recovery URL (my SMS, email, smoke signals, etc.).

#### `GET /auth/register/facebook`

This route will only work if the user is not already logged in (checked via the session variable `req.session.loggedIn`).

In case of successful Facebook login, it will first check that that Facebook ID isn't already used in the application; if it isn't, it will associate the Facebook profile ID with the user by adding a record to the store `usersStrategies`.

The Facebook ID is stored in `field1` in the `userStrategies` store.

#### `GET /auth/resume/facebook`

This route is totally equivalent to `/auth/signin/facebook`, since they do essentially the same thing. In terms of Hotplate, the difference is in the _response type_: since `signin` one is meant to be used from a login screen and `resume` is meant to be used within the application, the _response type_ will definitely be different.

### Routes created by `hotCoreAuth/auth/local.js`

The plugin `hotCoreAuth/local` will create the following routes:

* Manager: POST `/auth/manager/local`
* Signin: POST`/auth/signin/local`
* Recover: POST`/auth/recover/local`
* Register: POST`/auth/register/local`
* Resume: POST`/auth/resume/local`

This plugin is somewhat "atypical" in terms of hotCoreAuth and passport, because -- unlike the others -- it doesn't require two step authentication: the response is provided by these URLs directly, rather than by a callback URL. This means that the `local` plugin is usable with the `ajax` response type (although that's not a must).

Here is the description of each one.

#### `POST /auth/manager/local`

This route will only work if the user is already logged in (checked via the session variable `req.session.loggedIn`) since it's meant to be used to _add_ a new strategy to a logged in user.

This route will either add a new `local` strategy for the user (using given `login` and `password`), or it will update the existing `local` strategy information with the provided `login` and `password`.

Input:
* `login` -- the login name to be changed
* `password` -- the password to be set for that login name. If the password is `*`, then it's left unchanged.

The record in `usersStrategies` will have `field1` set as the login name, and `field3` as an encrypted version of the user's password.

_Note_: if `local` wasn't an allowed strategy for the user (that is, a new record is being added to `usersStrategies`), the new strategy is added via a REST API call, like so: `usersStrategies.apiPost( { userId: req.session.userId, strategyId: 'local', field1: login.toLowerCase(), field3: password }` so that any notification mechanism (via comet) to existing users is actually triggered (e.g. the interface will be able to know that `login` is now a viable strategy).

#### `GET /auth/signin/local`

This route will only work if the user is _not_ logged in (checked via the session variable `req.session.loggedIn`) since it's meant to be used to actually login.

In case of successful login, it will set `req.session.loggedIn` and `req.session.userId`. A 'successful login' here means that there is a record in `usersStrategies` where `strategyId` is `local`, `field1` is `user` and (hashed) `field2` is `password` .

Input:
* `login` -- the login name used to sign in
* `password` -- the password


#### `GET /auth/recover/local`

FIXME

This route will only work if the user is _not_ logged in (checked via the session variable `req.session.loggedIn`) since it's meant to be used to recover access to the application.

In case of successful Facebook login, it will update the `users` table setting the fields `user.recoverToken` and `user.recoverTokenCreated`.

The token will then be used by the route `/recover/:recoverToken` to let the user back in.

When recovering, the signal XXXXXXXX (TODO: decide name and emit it!) is emitted, to notify the application which will, in turn, be responsible of sending the user the secret recovery URL (my SMS, email, smoke signals, etc.).

#### `GET /auth/register/local`

FIXME

This route will only work if the user is not already logged in (checked via the session variable `req.session.loggedIn`).

In case of successful Facebook login, it will first check that that Facebook ID isn't already used in the application; if it isn't, it will associate the Facebook profile ID with the user by adding a record to the store `usersStrategies`.

The Facebook ID is stored in `field1` in the `userStrategies` store.

#### `GET /auth/resume/local`

FIXME

This route is totally equivalent to `/auth/signin/facebook`, since they do essentially the same thing. In terms of Hotplate, the difference is in the _response type_: since `signin` one is meant to be used from a login screen and `resume` is meant to be used within the application, the _response type_ will definitely be different.
