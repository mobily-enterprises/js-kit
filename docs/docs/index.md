# Hotplate documentation

Hotplate is based on a very simple core and several modules. The documentation will cover comprehensively every single aspect of Hotplate.

## Basic concepts and dependencies

Hotplate has several dependencies. It's important that you get acquainted to the modules Hotplate uses.

* [Intro](intro) -- Introduction to Hotplate, its goals, and the core technologies it uses
* [Dependencies](dependencies) -- The modules Hotplate depends on. Note that these are the in-house modules developed for Hotplate specifically (although they make sense as stand-alone modules)

## Hotplate core

Hotplate itself is a very small core (under 40 lines!) using underlying modules to do everything.

* [Hotplate](hotplate)

## Basic Hotplate application

Hotplate is a normal module based on Express. However, it does expect a couple of extra things in your server file to work properly.

* [Hotplate boilerplate](boilerplate) -- A boilerplate you can use as bases for your own applications.
* [Hotplate sample application](sample) -- A sample application to show off some of Hotplate's features

## Server modules

Server modules are the ones that don't provide any cient-side code -- or, if they do, it's very basic Javascript code necessary to the module to function.

* [hotCore](hotCore) -- Will load all of the core modules
* [hotCoreAuth](hotCoreAuth) -- The authentication module
* [hotCorePage](hotCorePage) -- The page generation module

## Client modules

Client modules are the ones focused at providing a specific client-side library as well as providing all of the support functions to make sure that a client-side library adheres to the [Hotplate client blueprint].

* [Blueprints](blueprints) -- Blueprints that every client library should follow
* [hotClientDojo](hotClientDojo) -- Dojo support

