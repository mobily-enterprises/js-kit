
/* TODO:

 * Server-side hook invoke
 * Fix logging (make extra module that works with hooks)
 * 

*/

/*!
 * Module dependencies.
 */

var util = require('util')
, fs = require('fs')
, path = require('path')
, express = require('express')
, send = require('send')
, Vars = require('./Vars.js')
, Csses = require('./Csses.js')
, Jses = require('./Jses.js')
;


/**
 * Hotplate constructor.
 *
 * The exports object of the `Hotplate` module is an instance of this class.
 * Most apps will only use this one instance.
 *
 * @api public
 */

function Hotplate() {

  // Default options
  this.options = {};
  this.options.staticUrlPath = '/lib/dojo/hotplate';
  this.options.modulesLocalPath = 'modules/node_modules'; // Location where modules are stored

  this.app = {}; // A link to the express App, as submodules might need it
  this.modules = {}; // A list of installed modules
  this.modulesAreLoaded = false; // True if modules are loaded

  this.vars = new Vars(); // A set of "variables" set by clients
  this.csses = new Csses(); // A list of CSS files added by the modules
  this.jses = new Jses() ; // A list of JS files added by the modules

  this.Vars = Vars;
  this.Csses = Csses;
  this.Jses = Jses;


  // The page template
  this.pageTemplate = "<!DOCTYPE HTML>\n<html>\n<head>\/<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\/<title>[[TITLE]]</title>\n[[HEAD]]\n</head>\n<body>\n[[BODY]]\n</body>\n";

};


/**
 * Sets hotplate options
 *
 * ####Example:
 *
 *     hotplate.set('test', value) // sets the 'test' option to `value`
 *
 * @param {String} key
 * @param {String} value
 * @api public
 */
Hotplate.prototype.set = function (key, value) {
  if (arguments.length == 1)
    return this.options [ key];
  this.options [ key] = value;
  return this;
};


/**
 * Gets hotplate options
 *
 * ####Example:
 *
 *     hotplate.get('test') // returns the 'test' value
 *
 * @param {String} key
 * @method get
 * @api public
 */
Hotplate.prototype.get = Hotplate.prototype.set;


/**
 * The exports object is an instance of Hotplate.
 *
 * @api public
 */

module.exports = exports = new Hotplate;
var hotplate = module.exports;


/**
 * The Hotplate constructor
 *
 * The exports of the mongoose module is an instance of this class.
 *
 * ####Example:
 *
 *     var hotplate= require('hotplate');
 *     var hotplate2 = new hotplate.Hotplate();
 *
 * @api public
 */

hotplate.Hotplate = Hotplate;


/**
 * Set the "app" attribute of the hotplate object
 *
 * This is important as the hotplate object
 * has functions to add routes
 * 
 * @param {Express} The express object used in the application
 * 
 * @api public
 */


Hotplate.prototype.setApp = function(app){
  this.app = app;
}


Hotplate.prototype.loadModules = function() {

  var that = this;

  // Can't do this twice
  if( this.modulesAreLoaded ) return;
  this.modulesAreLoaded = true;

  // Load the installed modules.
  fs.readdirSync( path.join( __dirname, this.options.modulesLocalPath ) ).forEach( function( moduleName ) {
    if( moduleName == 'hotplate' ){
      console.log( "Skipping self stub..." );
    } else {
      var modulePath = path.join( __dirname, that.options.modulesLocalPath,  moduleName );
      var moduleFileLocation = path.join( modulePath, 'server/main.js' );
      var moduleEnabledLocation = path.join( modulePath, 'enabled' );

      // If the module is enabled (it has a file called 'enabled'), load it
      if( fs.existsSync( moduleEnabledLocation ) ){
        console.log( "Loading module " + moduleName + '...' );
        if( fs.existsSync( moduleFileLocation ) ){
          console.log("Module " + moduleName + " enabled WITH server-side stuff" );
          r = require( moduleFileLocation ) ;
          that.modules [ moduleName ] = { name: moduleName, file: moduleFileLocation, module: r };
        } else {
          console.log("Module " + moduleName + " didn't have any server-side stuff (no server/main.js)" );
          that.modules [ moduleName ] = { name: moduleName, module: {}  };
        }


        // Automatically get 'main.js' and 'main.css' for that module
        // added to the list of files that should be displayed
        // in the page hosting the modules
			  var mainJsFileLocation = path.join( modulePath, 'client/main.js' );
        var mainCssFileLocation = path.join( modulePath, 'client/main.css' );
        if( fs.existsSync( mainJsFileLocation ) ){
          that.jses.add( moduleName, 'main.js' );
        }
        if( fs.existsSync( mainCssFileLocation ) ){
          that.csses( moduleName, 'main.css' );
        }

      } else {
        console.log( "Skipping " + moduleName + " as it's not enabled" );
      }
    }

  });

  // Initialise loaded modules, calling their init() functions
  for( var keys in this.modules) {
    moduleObject = this.modules [ keys ];
    if( moduleObject.module.init ) {
      moduleObject.module.init();
    }
  };

  // Process the page template so that it contains the vars, jses and csses
  // added by the modules
  this.pageTemplate = this.processPageTemplate( { vars: this.vars, jses: this.jses, csses:this.csses }, true );

}


Hotplate.prototype.clientPages = function(options){
  that = this;

  options = options || {};

  var staticUrlPathRegExp = new RegExp('^' + this.options.staticUrlPath + '/(.*?)/(.*)');

  // root required
  if (!root) throw new Error('static() root path required');

  return function static(req, res, next) {

    // If there is a match...
    var  match = req.path.match( staticUrlPathRegExp );
    if( match && that.modules[ moduleName ] ){
      var moduleName = match[1];
      var fileLocation = match[2];
      console.log("Test: " + moduleName + ' , ' + fileLocation );
    
     var localDir = path.join('hotplate' , that.options.modulesLocalPath, moduleName , '/client/');

        function error(err) {
          if( 404 == err.status) return next();
          next(err);  
        }
        send(req, fileLocation )
         .maxage(options.maxAge || 0)
         .root(localDir)
         .hidden(options.hidden)
         .on('error', error )
         .pipe(res);
    }
  }

};


Hotplate.prototype.processPageTemplate = function( elements, leavePlaceholders ) {

  elements = elements || {};

  var r = this.pageTemplate;

  // Replace the elements: csses, jses and vars will go where [[HEAD]] is,
  // the title will go wheer [[TITLE]] is, the body where [[BODY]] is
  if ( elements.csses ) r = r.replace(/(\[\[HEAD\]\])/,  elements.csses.render() + '$1' );
  if ( elements.jses )  r = r.replace(/(\[\[HEAD\]\])/,  elements.jses.render() + '$1' );
  if ( elements.vars)   r = r.replace(/(\[\[HEAD\]\])/,  elements.vars.render() + '$1' );
  if ( elements.title ) r = r.replace(/(\[\[TITLE\]\])/, elements.title + '$1' ); 
  if ( elements.body )  r = r.replace(/(\[\[BODY\]\])/,  elements.body + '$1' ); 
  
  // Take placeholders away. The template is probably being processed by a page,
  // which most likely added its own title, csses, js, etc.
  if( ! leavePlaceholders){
      r = r.replace(/\[\[(HEAD|TITLE|BODY)\]\]/g, '');
  }

  return r;
}

Hotplate.prototype.Logger = function(entry){
  // FIXME: this will call the right function to do the logging

  // This will need to:
  // Get other registered modules to modify "entry" (in particular, auth will add workspaceName, etc.)
  // Get other registered modules to store the entry (in particular, the module that will offer browsing and filtering options)

// Save a log entry onto the Log table, with the current timestamp. Workspace and userId can be empty
var originalLogger = function(logEntry){


  var Log = mongoose.model("Log"),
      req = logEntry.req;

  log = new Log();

  // Sorts out log.reqInfo
  if ( logEntry.req){
    log.reqInfo = JSON.stringify({
      info   : req.info,
      headers: req.headers,
      method : req.method,
      body   : req.body,
      route  : req.route,
      params : req.params 
    });
  } else {
    logEntry.reqInfo = {};
  }
 
  // req.application.login is always set if the user has logged in

    
  // Set other variables if they are defined (or default to '')
  if( req.application) {
    log.workspaceId   = req.application.workspaceId   ? req.application.workspaceId   : null;
    log.workspaceName = req.application.workspaceName ? req.application.workspaceName : '';
    log.userId        = req.application.userId        ? req.application.userId        : null;
    log.login         = req.application.login         ? req.application.login         : '';
    log.token         = req.application.token         ? req.application.token         : '';
  } else {
    log.workspaceId   = null;
    log.workspaceName = '';
    log.userId        = null;
    log.login         = '';
    log.token         = '';
  }

  // Sorts out all of the other fields with sane defaults.
  // FIXME: improve this code, it's grown into something ugly and repetitive
  // http://stackoverflow.com/questions/12171336/saving-an-object-with-defaults-in-mongoose-node
  log.logLevel   = logEntry.logLevel  ? logEntry.logLevel  : 0;
  log.errorName  = logEntry.errorName ? logEntry.errorName : '';
  log.message    = logEntry.message   ? logEntry.message   : '';
  log.data       = logEntry.data      ? logEntry.data      : {};

  // Sorts out log.loggedOn
  log.loggedOn = new Date();
  log.save();
} 



}
