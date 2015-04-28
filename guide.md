---
layout: page
---

Hotplate: a practical guide
===========================

Welcome to Hotplate! If you are reading this guide, it means that you are egar to get started and see "something" happen.

This guide will do exactly that. By the end of it, you will have a good understanding of Hotplate and will be able to write modern, cutting-edge, network-resiliant software.

# The basics

Hotplate itself is essentially a simple module that provides:

* A way to call hooks and get their results. This happens using the module [https://github.com/mercmobily/EventEmitterCollector](EventEmitterCollector), which basically allows you to emit an event, and then get each listener to (asynchronously) return a result.

* An easy way to assign a configuration object. This happens using the module [https://github.com/mercmobily/deepobject](DeepObject) around a "config" variable. So, you can write things like `hotplate.config.get( 'hotClientDojo/dojoUrl' )` or, more excitingly, `hotplate.config.set('hotCoreAuth.strategies.facebook.clientID', 9999999999);`.

That's it. Hotplate itself is only 25 lines. The modules that come with it, however, do everything.

Some of the modules are considered "core" -- they all start with `hotCoreXXX`. They provide basic functionality for any "software as a service". Other modules are not part of core: for example the `hotClientDojo` module offers functionalities to use Dojo within Hotplate.

## A note on the shown examples

My main aim is to always show fully working applications every time I show something. So, when you see something like **[starting_point]**, what I actually mean is the branch named `starting_point` of the repository [hotplate-examples](https://github.com/mercmobily/hotplate-examples). You can easily checkout that branch using Git, or browse it from GitHub.

Once you've downloaded the code, you will need to do the usual:

    npm install

And everything should work fine.

## Getting started with Hotplate

First of all, checkout **[starting_point]**. That's the basic, straight "expressJS" application that comes out of creating an application using the command `express`. The application's source code is pretty basic:

    /**
     * Module dependencies.
     */

    var express = require('express');
    var http = require('http');
    var path = require('path');

    var app = express();

    // all environments
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }

    http.createServer(app).listen(app.get('port'), function(){
      console.log('Express server listening on port ' + app.get('port'));
    });

Basically, all of the template-oriented parts of Express (see: Jade) has been taken out. While you might still want to use Jade (that is, it's not forbidden to do so), keep in mind that Hotplate aims at creating one-page, rich applications. So, chances are that you won't actually need to create "pages" as such in your application -- or, at least that's the hope.

So, now start integrating hotplate into your world.

## Your first Hotplate module

The most important bit to add to your app.js file is the code that `requires()` and runs Hotplate modules. That's easily done:
(See **[first_hotplate]**)



## More Hotplate features

### Setting Hotplate-wide variables


