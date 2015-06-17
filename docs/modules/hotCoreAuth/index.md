---
layout: page
---

Provides authentication abilities to Hotplate, including password recovery, registration, login, credential management, and in-app resume.

This module provides authentication abilities to your application by:

* Defining authentication stores to be used in your app
* Creating authentication routes to handle authentication using Passport

@module hotCoreAuth

This file provides authentication abilities. This is the "master" file which will then load the required sub-modules (at the moment, `local` and `facebook`) for strategy-specific functionalities.

While most of other authentication systems are based on username/password, and then allow you to associate other authentication methods to those username/password pairs (Oauth, etc.), in hotCoreAuth _each login method is the equal_. You might decide to sign up with your Facebook profile, and never bother with setting username/password or vice-versa.

# hotCoreAuth basics

`hotCoreAuth` is a complex module that uses Passport to abstract how authentication works. All you need to do is configure hotCoreAuth so that it does what you want it to do. Here are the terms you need to know so that you can configure it correctly for your application.

_NOTE: `hotCoreAuth` uses passport for every authentication strategy, including `local`. This is done mainly for consistency: `local` is not a two-step authentication, and it wouldn't need Passport stricky speaking._

There are five _actions_ connected to authentication:

* `signin` -- to actually login using existing credentials
* `register` -- to register as a new user, and automatically assign a strategy to them
* `recover` -- to reset credentials
* `manager` -- to manage credentials. This is used to associate a new strategy to an existing (logged in) user
* `resume` -- to resume an existing session if authentication is expired.

Note that while both `register` and `manager` associate a strategy to a user, `register` also _creates_ a brand new user. Also, while both `signin` and `resume` basically check that the user is allowed to login, the difference is that with `login` the user is logging in, and in `resume` the user is resuming the use of the application once she has been logged out (and the application's page is still open).

There are currently two implemented strategies (although it's trivial to create more):

* `local` -- using simply a combination of login and password
* `facebook` -- using Facebook's authentication scheme

hotCoreAuth will create give authentication URLs for each strategy; for example for `facebook` it will create:

* GET `/auth/signin/facebook`
* GET `/auth/register/facebook`
* GET `/auth/recover/facebook`
* GET `/auth/manager/facebook`
* GET `/auth/resume/facebook`

For the `local` strategy, it will create:

* POST `/auth/signin/local`
* POST `/auth/register/local`
* POST `/auth/recover/local`
* POST `/auth/manager/local`
* POST `/auth/resume/local`

These URLs are the ones clients will have to use to complete the required action. Note that while some URLs will require a payload (for example, `local` will require `login` and `password` in their POST payload), others will deal with authentication without any data (users will be redirected to Facebook's login screen).

In hotCoreAuth, the _operation_ that is about to be performed is defined by the pair _strategy-action_. For example, `local-signin`, or `facebook-recover`, etc.

What these URLs will respond with depends on the _response type_, which is decided by the client by setting a cookie named after the operation's name (for example `XXXX-signin`, `XXXX-recover`, `XXXX-register`, `XXXX-resume`, `XXXX-manager`, where `XXXX` can be `facebook`, `local`, or any other authentication strategy). For example, an ajax-based login screen based on local login will have something like this in code: `cookie( 'local-signin', 'ajax', { path: '/' } );`.

Defining the response type is crucial for the application. If your application allows you to click on a "Facebook" link, which points straight to `/auth/signin/facebook`, once the Facebook authentication process is finished you will want to be redirected to either the "login successful" success page, or the "login failed" page. If you open a new browser window for authentication, once the Facebook process is finished, you will probably want to redirect the opening window to the correct URL.

Here is a list of possible values _response types_ (corresponding to the cookie's value):

* `content` -- The function returned by `hotCoreAuth.contentResponsePage` is run with parameters `strategyId, action, user, profile`, and the result is then served to the client. The (redefinable) stock function will simply display an HTML page with the word "RESPONSE" in it; the page will close (thanks to a Javascript timer) after 5 seconds. If you use this response type, you ought to redefine `hotCoreAuth.contentResponsePage` to something more meaningful.

* `close` -- The function returned by `hotCoreAuth.closeResponsePage` is run with parameters `strategyId, action, user, profile`, and the result is then served to the client. The (redefinable) stock function will work like this: if `user` is set (login successful): the window is closed immediately. If `user` isn't set and `profile` has a `message` attribute, the message is displayed with a Javascript `alert()` and the window is then closed.

* `ajax` -- If `user` is set, it returns a page with status 200, and -- as contents -- a JSON string like so: `{ user: user, profile: profile }`.  If `user` isn't set, it returns a page with status `403` and a JSON string like so: `{ message: error }` NOTE: Setting `ajax` as a response type only makes sense for local authentication, since the ajax information will be returned after a redirect, which will basically result in an HTML page containing successful or unsuccesful JONN data.

* `redirect-opener` -- The function returned by `hotCoreAuth.redirectOpenerResponsePage` is run with parameters `strategyId, action, user, profile`, and the result is then served to the client. The (redefinable) stock function will work like this: if the user isn't set (login failed) and `profile.message` is set, it will display `profile.message` in a Javascript alert coming from the opener; otherwise (login is successful), it will redirect the opener window by setting its location to  hotCoreAuth.redirectURLs.success['action']. In any case, the current window will be closed.

* `redirect` -- If `user` is set, the current window redirected to the URL set as `hotCoreAuth.redirectURLs.success['action']`. If `user` isn't set, `req.session.messages` is pushed `{ type: 'error', message: profile.message }` and  the window is redirected to `hotCoreAuth.redirectURLs.fail['action']`. Note that the new page will have access to the message via the session.

hotCoreAuth provide three stores that will hold the authentication data:

* `authStrategies` A pseudo-store, basically containing the keys of the configuration object `hotCoreAuth.strategies`. It implements `get` and `getQuery`.

* `users`. A simple store that contain just the IDs of the created users. _There is no username associated to a user!_ A user is just an abstract entry: what really matters the the ID.

* `usersStrategies`. The list of strategies associated to a specific user. Basically, it defines how a user can actually login. It implements `get`, `getQuery` and `delete`; the store has a public URL so that existing users to change how they are allowed to login. Each record contains the strategyId and four fields, which will contain strategy information. For example the strategy `facebook` will have the Facebook's userId as `field1`, whereas the `local` strategy will have the user's login name in `field1` and the user's password in `field3`. Note that `field3` and `field4` are considered 'protected' (which imply that they will not be returned by REST queries).

For more information about stores, check out {{#crossLink "hotCoreAuth.hotCoreAuth/contentResponsePage:method"}}HERE{{/crossLink}}


http://127.0.0.1:4000/serverAPI/classes/hotCoreAuth.hotCoreAuth.html#method_contentResponsePage
http://127.0.0.1:4000/serverAPI/classes/hotCoreAuth.hotCoreAuth.html#methods_closeResponsePage

It should link to: hotCoreAuth.html#events_stores


# Configuring hotCoreAuth

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

* `redirectURLs`. These URLs are used by makeResponder for the redirect and redirect-opener actions
 as well as /recover/:recoverToken (whick will redirect to `hotCoreAuth.redirectURLs.success.recover`).
Note that `hotplate.routeUrlsPrefix` prefixes are honoured thanks to the prefix() call (as they should).

* `contentResponsePage`. The function that will generate the page content in case the response type is set
as `content`. Note that a basic `basicContentResponsePage` function is set as default and can be used as
a template.

* `closeResponsePage`. The function that will generate the page responsible of closing the current window in case the response type is `close`. Note that a basic `basicCloseResponsePage` function is set as default and can be used as
a template.

* `redirectOpenerResponsePage`. The function that will generate the page responsible of redirecting the
opener to the appropriate URL. Note that a basic `BasicRedirectOpenerResponsePage` function is set as default and can be used as a template


# hotCoreAuth internals: hotCoreAuth provides those functionalities

TODO: Move facebook configuration example somewhere more meaningful. Probably the facebook module page (with link to it)

You don't need to know how hotCoreAuth works internally to use it; you will however need to know how it works if you intend to write extra modules for it.

When it's run, `hotCoreAuth` will scan the configuration object `hotCoreAuth.strategies`: each key in the object is a strategy name. For example, for `local` `hotCoreAuth` will require `auth/facebook.js` which in turn will define:

* `/auth/signin/facebook`, `/auth/resume/facebook/callback`
* `/auth/register/facebook`, `/auth/resume/facebook/callback`
* `/auth/recover/facebook`, `/auth/resume/facebook/callback`
* `/auth/manager/facebook`, `/auth/resume/facebook/callback`
* `/auth/resume/facebook`, `/auth/resume/facebook/callback`

Each URL will actually be managed completely by Passport.

Understanding exactly what happens with hotCoreAuth is crucial to fully understand Passport. I will explain here how the `facebook-signin` operation happens, step by step.

First of all, the configuration object `hotCoreAuth.strategies` will need to have `facebook` defined as follows:

    facebook: {
      clientID: 'XXXXXXXXXXXX',
      clientSecret: 'XXXXXXXXXX',
    }

You will need to get those values from Facebook, as they are unique to you (you will actually need to logon to Facebook to obtain them).

`hotCoreAuth` will scan `hotCoreAuth.strategies`, will find `facebook`, and will load `auth/facebook.js`.

For `signin`, `facebook.js` will first define a `named strategy` called `facebook-signin`, as well as define two routes:

````
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
````

Here is what this code does in detail.

With `passport.use( 'facebook-signin', new FacebookStrategy({`, you are registering a named strategy called `facebook-signin` with a bunch of facebook-specific parameters (`clientID`, `clientSecret`, etc.) and -- most importantly -- a callback used to check whether the `profile` returned by Facebook is actually allowed to sign in. This callback will call `done()` with the following parameters:

* `err` -- as usual in node
* `user` -- the user object, or `false` if authentication didn't work
* `info` -- additional information

The next two lines will define two routes.

The route `/auth/signin/facebook` is managed completely by Passport, which with `passport.authenticate('facebook-signin')` returns a valid Express route. This route, which will generally be opened in a new window in your client application, will redirect to facebook.com, passing Facebook the `clientID`, `clientSecret` and `callbackURL`. At the end of the process, Facebook will then always redirect the user's browser to `/auth/signin/facebook/callback` (the callback URL provided earlier to Facebook), which is -- needless to say -- another URL managed by Passport.

This is where things get interesting.

Facebook will connect to `/auth/signin/facebook/callback`, passing it information relevant to authentication: namely whether it worked or not, and -- if it did work -- the profile information. This is when passport calls the authentication callback, with the parameters `req, accessToken, refreshToken, profile, done`.  If `profile` isn't defined, then it means that Facebook authentication failed. If `profile` is set, then authentication in Facebook did work. Keep in mind that a successful Facebook login doesn't mean that that Facebook profile is allowed to signin into your application; it also means that _Facebook_ has verified that the user has valid Facebook credentials.

The route definition for the second URL can look a little confusing:

    app.get('/auth/signin/facebook/callback', function( req, res, next) {
      passport.authenticate('facebook-signin',  makeResponder( req, res, next, 'facebook', 'signin')  )(req, res, next);
    });

Basically, the whole route is delegated to Passport via `passport.authenticate()`, which will:

* Receive the response from Facebook
* Call the custom authentication function passing it `req, accessToken, refreshToken, profile, done`. The custom authentication function will call its callback with `err, user, profile`
  * The custom authentication function will need to set `req.session.loggedIn` and `req.session.userId` if that specific Facebook profile is registered
* Run the function _returned by `makeResponder()`_, passing it `err, user, profile`. Here where `user` and `profile` are the same values returned by the custom authentication function.

This is probably the trickiest part of hotCoreAuth: here, `makeResponder( req, res, next, strategy, action )` is a function generator, which will return a function with the right signature `(err, user, profile )`.

Basically, `makeResponder()` is the function that will respond to the client, having all of Express' request/response variables (`req, res, next`) and the login information (`user, profile`).



/**
  The stock function that will return an HTML page responsible of displaying content. Typically, this window should stay up for a few seconds, before self-closing.

  This is definitely too basic for _any_ use, since all it does is display "RESPONSE". You will definitely need to customise it so that it does something useful.

  To redefine it, just set the right hotplate configuration object in your application:

      hotplate.config.set('hotCoreAuth.contentResponsePage' ) = function( strategyId, action, user, profile ){
        ...
      }

  .

  @method contentResponsePage
  @param {String} strategyIdThe make of the strategy (e.g. 'facebook', 'local')
  @param {String} action The action (`signin`, `recover`, `register`, `resume`, `manager`)
  @param {Object} user If authentication was successful, the user object (a simple `{uid: XXXXXXX}`` object); otherwise, `false`
  @param {Object} profile If authentication was successful, the profile information (if available); otherwise, a simple object containing just a `message` attribute (for example ``{ message: "Login failed" }`)
*/
var basicContentResponsePage = function( strategyId, action, user, profile ){
  var response = '';
  response += "<html><body><script type=\"text/javascript\">setTimeout(function(){ window.close() }, 5000);</script>RESPONSE</body></html>";
  return response;
};


/**
  The stock function that will return an HTML page responsible of 1) Closing the current window 2) Display `profile.message` if login failed and there is a message to display.
  This is probably too basic for a real use, but it works.


  To redefine it, just set the right hotplate configuration object in your application:
      hotplate.config.set('hotCoreAuth.closeResponsePage' ) = function( strategyId, action, user, profile ){
        ...
      }

  .

  @method closeResponsePage
  @param {String} strategyIdThe make of the strategy (e.g. 'facebook', 'local')
  @param {String} action The action (`signin`, `recover`, `register`, `resume`, `manager`)
  @param {Object} user If authentication was successful, the user object (a simple `{uid: XXXXXXX}`` object); otherwise, `false`
  @param {Object} profile If authentication was successful, the profile information (if available); otherwise, a simple object containing just a `message` attribute (for example ``{ message: "Login failed" }`)

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

  This is probably too basic for a real use, but it works.

  To redefine it, just set the right hotplate configuration object in your application:

      hotplate.config.set('hotCoreAuth.redirectOpenerResponsePage' ) = function( strategyId, action, user, profile ){
        ...
      }
  .

  @method redirectOpenerResponsePage
  @param {String} strategyIdThe make of the strategy (e.g. 'facebook', 'local')
  @param {String} action The action (`signin`, `recover`, `register`, `resume`, `manager`)
  @param {Object} user If authentication was successful, the user object (a simple `{uid: XXXXXXX}`` object); otherwise, `false`
  @param {Object} profile If authentication was successful, the profile information (if available); otherwise, a simple object containing just a `message` attribute (for example ``{ message: "Login failed" }`)
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

It returns the authentication stores
The stores returned are:

## `authStrategies`

The strategies available. This store is a pseudo-store (it doesn't rely on data stored in a database). Its data is the keys of the configuration object `hotCoreAuth.strategies`, which is used to implement `get` and `getQuery`.

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


## `users`

The list of users. Note that only very little information is stored about the user itself: this table only stores the `id` and the `recoverToken` fields. It is not exposed to the client application at all: it's only created to be accessible via API within Hotplate itself.

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

## `usersStrategies`

The list of strategies associated to a specific user. It implements `get`, `getQuery` and `delete`, and it only allows querying to the record owner (session.userId needs to match the query string's userId). It also doesn't allow a user to delete their last remaining strategy (otherwise they won't be allowed to log back in, nor to recover their access).

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
      // Also, users are only allowed to `delete` a strategy if it's not the last one remaining
      checkPermissions: function( request, method, cb ){ ... },

      // The field `field3` and `field4` are taken out of the equation, as they are "secret"
      extrapolateDoc: function( request, method, doc, cb ){ ... }
    });
    stores.usersStrategies = new UsersStrategies();


Sets recover URL `/recover/:recoverToken` (for token recovery).
Also goes through the list of `AuthStrategies`, loads the right
files in `auth/{strategy name}.js` (e.g. {{#crossLink "hotCoreAuth.facebook"}}{{/crossLink}}), and runs them.
This basically ensures that all strategies have the right URLs all set for them to work.

