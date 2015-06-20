---
layout: page
---

# Hotplate

Hotplate itself i a very small core, surrounded by several powerful modules; each module is meant to do one thing, and do it well.

To show how small it is, here is Hotplate's full source code:

````
    var async = require('async')
      , EventEmitterCollector = require("eventemittercollector")
      , DeepObject = require("deepobject")
      , colorConsole = require('tracer').colorConsole()
      , path = require( 'path')
      ;
    var hotplate = exports;

    // Hotplate's core functionality
    hotplate.require = function( m ){ return require( m ); };
    hotplate.cachable = async.memoize;
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
````

I will go through every section right now.

# The required modules

````
var async = require('async')
  , EventEmitterCollector = require("eventemittercollector")
  , DeepObject = require("deepobject")
  , colorConsole = require('tracer').colorConsole()
  , path = require( 'path')
  ;
var hotplate = exports;
````

Here:

* `async` is used to "borrow" its powerful `memoize()` function, that is mapped as `hotplate.memoize()`.
* [EventEmitterCollector](https://github.com/mercmobily/EventEmitterCollector) is used to create the object `hotplate.hotEvents`, which is the heart of every Hotplate application
* [DeepObject](https://github.com/mercmobily/deepobject) is used to create the object `hotplate.config`, which will store configuration for every module in Hotplate
* `colorConsole` is used  to create the `hotplate.critical()` function, that will log a critical condition
* `path` is used to use `path.join()` in the `hotplate.prefix()` function`

# API

## `hotplate.require( moduleName )` {#docs-api-require}



hotplate.require = function( m ){ return require( m ); };

## `hotplate.cachable( function )` {#docs-api-cachable}

hotplate.cachable = async.memoize;

## `hotplate.hotEvents` {#docs-api-hotEvents}

hotplate.hotEvents = new EventEmitterCollector();

## `hotplate.config` {#docs-api-config}

hotplate.config = new DeepObject();

## `hotplate.critical( parameters )` {#docs-api-critical}

hotplate.critical = colorConsole.error.bind( colorConsole );

## `hotplate.prefix( routeString )` {#docs-api-prefix}

hotplate.prefix = function( p ){
  return path.join( hotplate.config.get( 'hotplate.routeUrlsPrefix' ), p );
};
