---
layout: page
---

# Hotplate documentation

Hotplate is based on a very simple core and several modules. The documentation will cover comprehensively every single aspect of Hotplate.

You should read this documentation top to bottom, following the instruction in this guide.

## Basic concepts and dependencies

Hotplate has several dependencies. It's important that you get acquainted to the modules Hotplate uses.

* [Intro](/docs/intro) -- Introduction to Hotplate, its goals, and the core technologies it uses
* [Dependencies](/docs/dependencies) -- The modules Hotplate depends on. Note that these are the in-house modules developed for Hotplate specifically (although they make sense as stand-alone modules)

You should be at least familiar with Hotplate's dependences, especially SimpleDeclare, JsonRestStores and SimpleDbLayer. You don't need to master them (JsonRestStores is really quite bit on its own), but at least know the main syntax.

## Hotplate core

Hotplate itself is a very small core (under 40 lines!) using underlying modules to do everything.
You should be very familiar with the way Hotplate does things; the main ones are fire-and-respond event handling with EventEmitterCollecotr and configuration with DeepObject.

Study carefully the 30 or so lines of code of Hotplate.

* [Hotplate](/docs/hotplate) -- Hotplate itself

## Basic Hotplate application

Hotplate is a normal module based on Express. However, it does expect a couple of extra things in your server file to work properly.

* [Hotplate simple application]() -- NOT YET DONE. A boilerplate you can use as bases for your own applications.
* [Hotplate multi-home application]() -- NOT YET DONE. A boilerplate you can use as bases for your own multi-homed applications (where users can invite others to a workspace, or register themselves).

This documentation will point to the Hotplate modules the sample applications use. You should study these applications and make yourself familiar with Hotplate's modules and the way they are used in real life applcations.

## Server modules

At this stage, you should be familiar with the basic boilerplate applications and should have an idea on how Hotplate modules work.

You should now have a good read of how the server side modules work. You should read every one of these files, even if you don't know everything by heart and don't tinker with every single bit of information. However, the more you _do_ tinker, the better.

Server modules are the ones that don't provide any cient-side code -- or, if they do, it's very basic Javascript code necessary to the module to function.

* [Hotplate's events](/docs/events) -- Hotplate's events' specifications
* [hotCore]() -- NOT YET DOCUMENTED
* [hotCoreAuth](modules/hotCoreAuth) -- The authentication module
* [hotCoreClientFiles]() -- NOT YET DOCUMENTED
* [hotCoreComet]() -- NOT YET DOCUMENTED
* [hotCoreCommonValidators]() -- NOT YET DOCUMENTED
* [hotCoreError]() -- NOT YET DOCUMENTED
* [hotCoreErrorProtocol]() -- NOT YET DOCUMENTED
* [hotCoreHandyCss]() -- NOT YET DOCUMENTED
* [hotCoreJsonRestStores]() -- NOT YET DOCUMENTED
* [hotCoreMultiHome]() -- NOT YET DOCUMENTED
* [hotCorePage]() -- NOT YET DOCUMENTED
* [hotCoreServerLogger]() -- NOT YET DOCUMENTED
* [hotCoreSharedCode]() -- NOT YET DOCUMENTED
* [hotCoreSharedValidators]() -- NOT YET DOCUMENTED
* [hotCoreStoreConfig]() -- NOT YET DOCUMENTED
* [hotCoreStoreExposer]() -- NOT YET DOCUMENTED
* [hotCoreStoreIndexer]() -- NOT YET DOCUMENTED
* [hotCoreStoreLogger]() -- NOT YET DOCUMENTED
* [hotCoreStoreRegistry]() -- NOT YET DOCUMENTED
* [hotCoreStoreVars]() -- NOT YET DOCUMENTED
* [hotCoreTransport]() -- NOT YET DOCUMENTED

## Client modules

Now that you know how the server does things, you should read how clients are supposed to work. Each client library should follow a _blueprint_, which is what Hotplate expects from a client-side library.

Client modules are the ones focused at providing a specific client-side library as well as providing all of the support functions to make sure that a client-side library adheres to the [Hotplate client blueprint].

* [Blueprints]() -- NOT YET DOCUMENTED -- Blueprints that every client library should follow
* [hotClientDojo]() -- NOT YET DOCUMENTED -- Dojo support

## Final words

There is a lot to learn, and -- more often than not -- there is _one_ specific way of doing things. At this stage, however, you should be able to write complete, reactive, store-based web applications in 4 hours rather than 40 (or, 1 day rather than a week and a half).

If you are reading this and you haven't studied the material below, then it's time to stop cheating and read up!
