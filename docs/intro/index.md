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

## Core technologies

Here are the core technologies used in Hotplate:

* Javascript. Too many resources to list. The book that got me started was [Object-Oriented Javascript](http://www.amazon.com/dp/1847194141). I think it's great that it covers how constructors and objects work.

* [NodeJs](http://nodejs.org/api/all.html)'s documentation. Not exactly tutorial style, but I find that actually going through Node's own documentation is a great way to actually get to know Node. It starts with a simple, basic web server and then goes through all the nitty-gritty about Node. I personally read it once a month, just to freshen up (you end up using a tiny fraction of what's in the docs)

* [ExpressJs](http://expressjs.com/)'s [guide](http://expressjs.com/guide.html) and [API](http://expressjs.com/api.html). Express is actually surprisingly simple and small. It doesn't actually do *that* much, what everything it does is really important, and it does it well. It's important to understand how middleware plugins work.

