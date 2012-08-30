hotplate
========

Framework to create multi-homed SaaS with NodeJs, Express, MongoDB, Dojo

Alright, here it is. Hotplate is a framework to create SaaS. It's still very much under heavy development. If you have a look at the TODO now, you will see what I mean.

These are the features that are already there:

Server
======

* Workspace creation. Each workspace is a world in its own right
* User creation, user login, session
* Ability to define a route as an API call (to be called with a token) or via the created session
* Single login to all workspaces
* Unified error management

Client
======
* Centralised interaction with the server
* Self-managing form handling (it will display the right error message for the right field)
* Self-managing app-wide and form-wide alert bar
* Neat organisation of files, widgets, etc

Much more to come now.
What's _urgent_ at the moment is the completion of version 1 of the code (see "finishing touches" in the TODO), code format improvement, and full documentation of each function.


