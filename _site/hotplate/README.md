hotplate
========

Hotplate is a framework that allows you to create 201X software in no time.
By 201X software I mean software that:

* allows you to log in using Facebook, Google, Twitter, Oauth1/2, or... well, login/password pair if you like
* available anywhere with a Javascript runtime (see: any modern browser)
* _feels like_ software, and not like a bunch of web pages
* uses a smart client, and a smart server; the smart client is to display information is the most user-friendly possibly way, whereas the smart server is to provide a bunch of secure data-store that are JSON-REST compatible
* handles errors (including, and in fact _especially_, network errors) properly. If anything really bad happens, the application must not stop. Instead, it will tell the user that something network-wise went wrong
* has the ability to communicate to your users in different ways: email, SMS, and whatever the world throws at us
* shows information **as it changes** to the user. If you have three tabs open, and change your user photo, from one tab, the other two tabs need to see the new photo as well
* is written as a bunch of small, maintainable modules

I realise that in 202X (that is, 2020 to 2030) writing software will be different. What is cool now, will be taken 100% for granted in 2025. Or maybe Javascript will be dead. I don't know, and I frankly don't care. I wrote Hotplate because I felt that this is what software _should_ be in 201X -- which is now.

# Getting into it

Hotplate is written for Node. It's a normal, no-frills Node-based framework. So, before you get into Node, you should know:

## Core technologies

* Javascript. Too many resources to list. The book that got me started was [Object-Oriented Javascript](http://www.amazon.com/dp/1847194141). I think it's great that it covers how constructors and objects work.

* [NodeJs](http://nodejs.org/api/all.html)'s documentation. Not exactly tutorial style, but I find that actually going through Node's own documentation is a great way to actually get to know Node. It starts with a simple, basic web server and then goes through all the nitty-gritty about Node. I personally read it once a month, just to freshen up (you end up using a tiny fraction of what's in the docs)

* [ExpressJs](http://expressjs.com/)'s [guide](http://expressjs.com/guide.html) and [API](http://expressjs.com/api.html). Express is actually surprisingly simple and small. It doesn't actually do *that* much, what everything it does is really important, and it does it well. It's important to understand how middleware plugins work.

## Support libraries

* [HTTPErrors](https://github.com/mercmobily/HTTPErrors). A very simple module that creates constructor functions for every HTTP return code (actually, not just errors).

* [SimpleDeclare](https://github.com/mercmobily/simpleDeclare). Javascript is a great language, but it lacks a simple way to declare object constructors and inheriting. A lot of node programmers actually do it by hand, writing `Class.prototype.someMethod = function(){ ... }`. I personally find that absolutely insane. SimpleDeclare solves this problem: it handles (multiple) inheritance, constructor methods, calling of inherited methods, and inheritance of constructor-wide methods. [SimpleDeclare is really small](https://github.com/mercmobily/simpleDeclare/blob/master/declare.js), but it does everything for you.

* [JsonRestStores](https://github.com/mercmobily/JsonRestStores) (which uses [SimpleSchema](https://github.com/mercmobily/SimpleSchema). Hotplate is all about stores -- really. JsonRestStores is a fundamental piece here: it allows you to create Json REST stores in no time, dealing with permissions, queries, error management, inherited stores, and so on. You should make yourself comfortable with JsonRestStores _while_ studying Hotplate.


## Hotplate's documentation

Hotplate comes with comprehensive documentation **[Note: not yet, documentation is in the works. The statement below are blatantly false]**. It has:

* [A comprehensive guide](http://www.hotplatejs.com/guide.html). The guide takes you from absolute zero, to actually knowing what you are doing with Hotplate. It's a tutorial-style guide, where you are explained everything step by step.

* [API documentation](http://www.hotplatejs.com/api.html). The API documentation is a great resource to explain what each module does and provides. It should be used as a reference once you have read the guide and you "know what you are doing".

# Current status:

* Authentication: DONE
* General code cleanup: DONE
* Fixing hotCoreCometMessages for real time comet updates: IN THE WORKS
* Write a sample, small application: UPCOMING
* Writing the messenging framework: UPCOMING
* Wire up the messenging framework with sample application: UPCOMING



