hotplate
========

_PLEASE NOTE: The module is going through major restrucuring and it's not currently functional._

Framework to create client/server applications using Node.js, by creating modules which provide both client and server code.
It started as a boilerplate to create SaaS, and evolved into a framework.

The module system includes:

* Possibility to create modules
* Modules are loaded automatically by a loader (conditionally if needed)
* Modules have a "public" directory, which will be accessible from the outside as SETTABLE-PATH/module-name
* The system provides a template page, which will be enriched by CSS and JS files added by the modules
* If present, main.css and main.js will be added automatically
* Each application exports a list of (placeable) client and server-side widgets
* Centralised logging function
* Simple way for modules to emit "events" and have "hooks" to act upon events (client-side _and_ server-side)

Already existing modules:

* Good HTTP-oriented errors
* Generic, simple error handling
* Basic protocol definition, ideal for Ajax-intensive applications
* Nice dojo widgets for your application
* Login/logout/register module
* Validators functions which are common client-side and server-side
* Roles applicable to users

Coming up:
* Module to manage users
* Module to manage email sending
* Module to manage email receiving

Maybe in the future:
It would be _great_ to create a module that allows users to *place* widgets wherever in the application.

