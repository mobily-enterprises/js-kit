Hotplate's support modules
==========================

Hotplate is written for Node. It's a normal, no-frills Node-based framework that can work very happily alongside with ExpressJS application.

Here are the modules Hotplate uses extensively.

## Support modules

* [HTTPErrors](https://github.com/mercmobily/HTTPErrors). A very simple module that creates constructor functions for every HTTP return code (actually, not just errors).

* [SimpleDeclare](https://github.com/mercmobily/simpleDeclare). Javascript is a great language, but it lacks a simple way to declare object constructors and inheriting. A lot of node programmers actually do it by hand, writing `Class.prototype.someMethod = function(){ ... }`. I personally find that absolutely insane. SimpleDeclare solves this problem: it handles (multiple) inheritance, constructor methods, calling of inherited methods, and inheritance of constructor-wide methods. [SimpleDeclare is really small](https://github.com/mercmobily/simpleDeclare/blob/master/declare.js), but it does everything for you.

* [EventEmitterCollector](https://github.com/mercmobily/EventEmitterCollector). In a world where signals are all about "fire and forget", EventEmitterCollector will emit events and collect results. This is what the modular nature of Hotplate is based on.

* [JsonRestStores](https://github.com/mercmobily/JsonRestStores) (which uses [SimpleSchema](https://github.com/mercmobily/SimpleSchema)). Hotplate is all about stores -- really. JsonRestStores is a fundamental piece here: it allows you to create Json REST stores in no time, dealing with permissions, queries, error management, inherited stores, and so on. You should make yourself comfortable with JsonRestStores _while_ studying Hotplate.

* [SimpleDbLayer](https://github.com/mercmobily/simpledblayer). Most stores are backed by database tables. In such cases, JsonRestStores will use SimpleDbLayer as the database layer. Note that SimpleDbLayer was created and specifically crafted for JsonRestStores. So, while the modules are independent, they are very closely related.
