---
layout: page
---

Welcome to Hotplate
===================

Hotplate is a framework that allows you to create 201X software in no time.
By 201X software I mean software that has the following features:

* **One page**. One page application, with ony minimal information transferred from the client to the server
* **Ready-to-go Advanced authentication**. Login, recover, register, manage, resume using any authentication method (Facebook, login/pass pair, etc.) and where no method is "favoured" or "special" (not even login/password)
* **JSON REST stores** for all data access; the client displays information is the most user-friendly possibly way and handles forms, while the server  provides a bunch of secure data stores that are JSON-REST compatible 
* **Live information**. Have live information and forms. This means that if you have three tabs open, and change your user photo in one tab, the other two tabs will get updated with the new photo as well. Other users logged in and display your user will get the update right away. Forms need to be live as well: if you are viewing a form, and another user changes the information, your form needs to get reloaded or warn you
* **Client independent**. The develpment world today has Angular, Backbone, Knockout, Ember, Polymer, Dojo... and more. Hotplate defines client _blueprints_, which are the required client-side components to work well with Hotplate and create "life applications" (see: if your username changes, it will have to change anywhere where it's it's displayed in the application)
* **Modularity**. A piece of software should be written as a bunch of independent modules, each one of them requiring specific CSS (included in the page), specific JSes, specific Javascript frameworks, etc.
* **Resilience**. Network and error resiliance; ff anything really bad happens, the application must not stop. Instead, it will tell the user that something network-wise went wrong
* **Security**. Implementing new stores needs to be safe and secure _by default_. It needs to be easy to write permission-granting routines for specific stores
* **Multi-homing**. Software needs to be multi-home ready, in a world where SaaS is king and people want to have their own little islands.
* **Communication** with users via email, SMS,  and whatever the world throws at us
* **Established patterns**. There needs to be a common way to carry out a common task.
* **API-ready**. Having an API needs to be as simple as flicking a switch. Rewriting the software logic for the API is the wrong route.
* **Logging**. Everything, good or bad, needs to be logged

I realise that in 202X (that is, 2020 to 2030) writing software will be different. What is cool now, will be taken 100% for granted in 2025. Or maybe Javascript will be dead. I don't know, and I frankly don't care. I wrote Hotplate because I felt that this is what software _should_ be in 201X -- which is now.

# Getting into it

Hotplate is written for Node. It's a normal, no-frills Node-based framework that can work very happily alongside with ExpressJS application.

Here are the technologies Hotplate is based on, bottom to top:

## Core technologies

* Javascript. Too many resources to list. The book that got me started was [Object-Oriented Javascript](http://www.amazon.com/dp/1847194141). I think it's great that it covers how constructors and objects work.

* [NodeJs](http://nodejs.org/api/all.html)'s documentation. Not exactly tutorial style, but I find that actually going through Node's own documentation is a great way to actually get to know Node. It starts with a simple, basic web server and then goes through all the nitty-gritty about Node. I personally read it once a month, just to freshen up (you end up using a tiny fraction of what's in the docs)

* [ExpressJs](http://expressjs.com/)'s [guide](http://expressjs.com/guide.html) and [API](http://expressjs.com/api.html). Express is actually surprisingly simple and small. It doesn't actually do *that* much, what everything it does is really important, and it does it well. It's important to understand how middleware plugins work.

## Support libraries

* [HTTPErrors](https://github.com/mercmobily/HTTPErrors). A very simple module that creates constructor functions for every HTTP return code (actually, not just errors).

* [SimpleDeclare](https://github.com/mercmobily/simpleDeclare). Javascript is a great language, but it lacks a simple way to declare object constructors and inheriting. A lot of node programmers actually do it by hand, writing `Class.prototype.someMethod = function(){ ... }`. I personally find that absolutely insane. SimpleDeclare solves this problem: it handles (multiple) inheritance, constructor methods, calling of inherited methods, and inheritance of constructor-wide methods. [SimpleDeclare is really small](https://github.com/mercmobily/simpleDeclare/blob/master/declare.js), but it does everything for you.

* [EventEmitterCollector](https://github.com/mercmobily/EventEmitterCollector). In a world where signals are all about "fire and forget", EventEmitterCollector will emit events and collect results. This is what the modular nature of Hotplate is based on.

* [JsonRestStores](https://github.com/mercmobily/JsonRestStores) (which uses [SimpleSchema](https://github.com/mercmobily/SimpleSchema)). Hotplate is all about stores -- really. JsonRestStores is a fundamental piece here: it allows you to create Json REST stores in no time, dealing with permissions, queries, error management, inherited stores, and so on. You should make yourself comfortable with JsonRestStores _while_ studying Hotplate.

* [SimpleDbLayer](https://github.com/mercmobily/simpledblayer). Most stores are backed by database tables. In such cases, JsonRestStores will use SimpleDbLayer as the database layer. Note that SimpleDbLayer was created and specifically crafted for JsonRestStores. So, while the modules are independent, they are very closely related.

## Hotplate's documentation

(Note: documentation is in progress)
Hotplate comes with comprehensive documentation:

* (0% complete) [Hotplate Quickstart]() A guide that shows you how to create a first blank application, and "what is what" there

* (30% complete) [Server API documentation](http://www.hotplatejs.com/serverAPI/index.html). It documents what each Hotplate module provides, from a server point of view.

* (0% complete) [Client API documentation](http://www.hotplatejs.com/clientAPI/index.html). It documents what each Hotplate module provides to the clients (for example Dojo widgets).

# Current status:

* Authentication: 100% -- DONE
* General code cleanup: 100% -- DONE
* Fixing hotCoreCometMessages for real time comet updates: 100% -- DONE
* Writing the messenging framework: 100% -- DONE
* Finish Hotplate itself and all related modules: 100% -- DONE
* >>> Write full documentation: 30%
* INITIAL RELEASE!
* Write a sample application that uses EVERY feature in Hotplate: 80%
* Write a small permission module: 0%
* Write a Stripe payment module: 0%
* FINAL RELEASE!

CURRENT ETA: July 2015
