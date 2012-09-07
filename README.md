hotplate
========

_PLEASE NOTE: The module is going through major restrucuring and it's not currently functional._

Framework to create node client/server applications using a hook system. The initial plugins allow you to:

* Emit "events" and have "hooks" to act upon events (client-side _and_ server-side)

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

Stay tuned!
