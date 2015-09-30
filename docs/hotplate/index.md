# Hotplate

Hotplate itself is in itself a very small core, surrounded by several powerful modules; each module is meant to do one thing, and do it well.

To show how simple it is, here is Hotplate's full source code:

    var async = require('async')
      , EventEmitterCollector = require("eventemittercollector")
      , DeepObject = require("deepobject")
      , colorConsole = require('tracer').colorConsole()
      , path = require( 'path')
      ;
    var hotplate = exports;

    // Hotplate's core functionality
    hotplate.cacheable = async.memoize;
    hotplate.hotEvents = new EventEmitterCollector();
    hotplate.config = new DeepObject();
    hotplate.critical = colorConsole.error.bind( colorConsole );
    hotplate.prefix = function( p ){
      return path.join( hotplate.config.get( 'hotplate.routeUrlsPrefix' ), p );
    };

    // Hotplate's sane defaults
    // You can (and should) over-ride them in your server.js file

    // Basic Hotplate prefixes for locations
    hotplate.config.set( 'hotplate.moduleFilesPrefix', '/hotplate' ); // hotClientXXX modules will use it as base URL
    hotplate.config.set( 'hotplate.routeUrlsPrefix', '/pages' ); // hotCoreAuth uses it as base URL

    // Db settings
    hotplate.config.set( 'hotplate.db', null );
    hotplate.config.set( 'hotplate.DbLayerMixin', function(){ } );
    hotplate.config.set( 'hotplate.SchemaMixin', function(){ } );

I will go through every section right now.

# The required modules

    var async = require('async')
      , EventEmitterCollector = require("eventemittercollector")
      , DeepObject = require("deepobject")
      , colorConsole = require('tracer').colorConsole()
      , path = require( 'path')
      ;
    var hotplate = exports;

Here:

* `async` is used to "borrow" its powerful `memoize()` function, that is mapped as `hotplate.memoize()`.
* [EventEmitterCollector](https://github.com/mercmobily/EventEmitterCollector) is used to create the object `hotplate.hotEvents`, which is the heart of every Hotplate application
* [DeepObject](https://github.com/mercmobily/deepobject) is used to create the object `hotplate.config`, which will store configuration for every module in Hotplate
* `colorConsole` is used  to create the `hotplate.critical()` function, that will log a critical condition
* `path` is used to use `path.join()` in the `hotplate.prefix()` function`

# API

## `hotplate.hotEvents` {#docs-api-hotEvents}

hotplate.hotEvents = new EventEmitterCollector();

## `hotplate.cacheable( function, [hasher] )` {#docs-api-cachable}

This function is a synonym of [async's `memoize()`](https://github.com/caolan/async#memoize). It's used in Hotplate for functions that are process or IO intensive, and are called several times. In case your function takes parameters, you will want to use a _hasher_ (a function that will return a unique string based on the passed parameters). The default hasher returns the first parameter "as is" by default. This means that it's only really useful if your function has exactly one parameter of type `String`.

For example when implementing a function for the event `stores`, which always returns the same result and has no paramrters, without caching you would write:

    hotplate.hotEvents.onCollect( 'stores', 'hotCoreAuth', function( done ){
      ...
    });

Since the function takes no parameters, and always returns the same set of data, you could speed things up and write:

    hotplate.hotEvents.onCollect( 'stores', 'hotCoreAuth', hotplate.cacheable( function( done ){
      ...
    }));

This will ensure that only the first time the function is called, your code is actually run; next time, the function will just return the previously returned value.

If your function's return value depends on the passed parameters, you will need to specify a `hasher` (unless your function accepts only one parameter of type `String`, in which case the default hasher will work just fine).

For example the event `pageElementsPerPage` has this signature:

    hotplate.hotEvents.onCollect( 'pageElementsPerPage', 'hotCoreAuth', function( req, pageName, done ){
      var vars = [];

      // Add the user ID to the page as a variable
      if( req.session.userId ) {
      }
        vars.push( { name: 'userId', value: req.session.userId } );

      done( null, { vars: vars });
    });

As you can see, the return value depends on `req.session.userId` and `pageName`. So, to memoize this function you would write:

    hotplate.hotEvents.onCollect( 'pageElementsPerPage', 'hotCoreAuth',
      hotplate.cacheable(
        function( req, pageName, done ){
          var vars = [];

          // Add the user ID to the page as a variable
          if( req.session.userId ) {
            vars.push( { name: 'userId', value: req.session.userId } );
          }

          done( null, { vars: vars });
        },

        function hasher( req, pageName ){
          return req.session.userId + pageName;
        }
      )
    );

As you can see, the hasher here will return a string, the contatenation of `req.session.userId` and the `pageName`. This means that hotplate.cacheable will always return the same value result when the callback is called for the same `pageName` and the same `userId` -- which is what we want, since the output won't change.

When deciding whether you will memoize a function or not, you need to keep in mind that you need to decide whether the function is process-intensive or not. Memoizing functions that just return a list of values without _actually_ doing any processing or I/O, or functions that are only run once, is mist likely not worth it.

## `hotplate.config` {#docs-api-config}

hotplate.config = new DeepObject();

## `hotplate.critical( parameters )` {#docs-api-critical}

hotplate.critical = colorConsole.error.bind( colorConsole );

## `hotplate.prefix( routeString )` {#docs-api-prefix}

hotplate.prefix = function( p ){
  return path.join( hotplate.config.get( 'hotplate.routeUrlsPrefix' ), p );
};
