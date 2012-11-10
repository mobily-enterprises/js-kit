hotplate
========

_PLEASE NOTE: The module is to be considered Alpha. The initial structure is ready, but it's still largely undocumented. I believe it will release a stable-release around Christmas (including a sample application that uses it). The basic structure is all there, core and non-core modules are done, but I still haven't decided on a few design issues, plus I would like others to actually check some of the things I did, to confirm that they are sane!_

Framework to create node client/server applications using a hook system. The initial plugins allow you to:

* Emit "events" and have "hooks" to act upon events server-side

* Define a standard sub-directory within your module's directory that will be available to the client. This is perfect for the side-client part of the story for your modules

* Define a list of JS/CSS files, as well as variables, which will be rendered onto a page. Each module can add files to the application via hooks. This means that if your module serves javascript widgets that need a specific css, you will be able to serve them, easy

* Centralised logging function (the logging module simply emits a "log" event, it's up to individual plugins to have hooks to define extra fields and to log things in the right spots. Example logging plugins that write data onto mongoDB are here)

The beauty of this is in the easy in which you can write modules. Basic modules include:

* Good HTTP-oriented errors server-side

* Basic protocol definition, client and server side, ideal for Ajax-intensive applications

* Generic, simple error handling with calls

* Nice dojo widgets for your application

* Login/logout/register module

* Validators functions which are common client-side and server-side

* Roles applicable to users

* Sending and receiving emails

* Manage email inbox

# Project's history

I discovered Dojo and the world of SaaS while working on [project management software](http://www.apollohq.com). My dislike towars PHP grew very quickly, to the point that I considered server programming as enjoyable as losing weight. Then, [Nodejs](http://www.nodejs.org/) came along, and things changed... although I was still very bothered by the idea that a widget couldn't possibly be client or server. I started looking into it more and more, and decided to use my Drupal experience to create the web's Next Big Thing in terms of software development: a system where you can develop self contained, modular widgets which include server and client code. Hotplate was born!


Stay tuned!
