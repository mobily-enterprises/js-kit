
var util = require('util'),
fs = require('fs'),
path = require('path'),
express = require('express'),
send = require('send');


function Hotplate() {

  // Default options
  this.options = {};
  this.options.staticUrlPath = '/lib/dojo/hotplate';

  this.app = {};
  this.modules = {};
  this.modulesDir = 'modules/node_modules';
  this.modulesAreLoaded = false;
  this.clientVars = {}
  this.csses = {};
  this.jsFiles = {};

  this.pageTemplate = "<!DOCTYPE HTML>\n<html>\n<head>\/<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\/<title>[[TITLE]]</title>\n[[HEAD]]\n</head>\n<body>\n[[BODY]]\n</body>\n";

  // Still unused
  this.loggingHandles = {};
};



// get and set functions for the options
Hotplate.prototype.set = function (key, value) {
  if (arguments.length == 1)
    return this.options[key];
  this.options[key] = value;
  return this;
};
Hotplate.prototype.get = Hotplate.prototype.set;

// Exports will export an instance of the Hotplate
module.exports = exports = new Hotplate;

// Set hotplate for internal use only
var hotplate = module.exports;

// Make the constructor accessible
hotplate.Hotplate = Hotplate;


// Sets the app variable, for sub-modules to use and enjoy
// (A lot of the modules will need it to define routes etc.)
Hotplate.prototype.setApp = function(app){
  this.app = app;
}

Hotplate.prototype.addStore = function( moduleName, storeUrl, methods) {
  this.stores[storeUrl] = { module: moduleName, methods: methods };
}

Hotplate.prototype.addCss = function( moduleName, cssPath) {
  this.csses[cssPath] = { module: moduleName };
}

Hotplate.prototype.addJs = function( moduleName, jsPath) {
  this.jsFiles[jsPath] = { module: moduleName };
}

Hotplate.prototype.setClientVars = function( moduleName, vars ) {
  this.clientVars[moduleName] = vars;
}


Hotplate.prototype.renderCss = function(){
  var r = '';
  for( var cssPath in this.csses){
    var module = this.csses[cssPath].module; 
    r += '<link href="' + path.join( this.options.staticUrlPath, module, cssPath) + '" media="screen" rel="stylesheet" type="text/css" />' + "\n";
  }
  return r;
}

Hotplate.prototype.renderJs = function(){
  var r = '';
  for( var jsPath in this.jsFiles){
    var module = this.jsFiles[jsPath].module; 
    r += '<script src="' + path.join( this.options.staticUrlPath, module, jsPath) + '" type="text/javascript"></script>' + "\n";
  }
  return r;
}


Hotplate.prototype.loadModules = function(modulesDir){

  var that = this;

  // Can't do it twice
  if( this.modulesAreLoaded ) return;

  this.modulesAreLoaded = true;
  this.modulesDir = modulesDir || 'modules/node_modules';

  // Load the installed modules.
  fs.readdirSync( path.join(__dirname, this.modulesDir) ).forEach( function(moduleName) {
    if( moduleName == 'hotplate' ){
      console.log( "Skipping self stub..." );
    } else {
      var modulePath = path.join(__dirname, modulesDir,  moduleName);
      var moduleFile = path.join(modulePath, 'server/main.js');
      var moduleEnabled = path.join(modulePath, 'enabled');

      // If the module is enabled (it has a file called 'enabled'), load it
      if( fs.existsSync( moduleEnabled ) ){
        console.log( "Loading module " + moduleName + '...' );
        if( fs.existsSync( moduleFile ) ){
          console.log("Module " + moduleName + " enabled WITH server-side stuff" );
          r = require( moduleFile ) ;
          that.modules[moduleName] = { path: moduleName, file: moduleFile, module: r };
        } else {
          console.log("Module " + moduleName + " didn't have any server-side stuff (no server/main.js)" );
          that.modules[moduleName] = { path: moduleName, file: moduleFile, module: {}  };
        }


        // Automatically get 'main.js' and 'main.css' for that module
        // added to the list of files that should be displayed
        // in the page hosting the modules
			  var mainJsFile = path.join(modulePath, 'client/main.js');
        var mainCssFile = path.join(modulePath, 'client/main.css');
        if( fs.existsSync( mainJsFile ) ){
          that.addJs(moduleName, path.join( 'main.js' ) );
        }
        if( fs.existsSync( mainCssFile ) ){
          that.addCss(moduleName, path.join( 'main.css' ) );
        }

      } else {
        console.log("Skipping " + moduleName + " as it's not enabled");
      }
    }

  });

  console.log(this.csses);
  console.log(this.jsFiles);

  // Initialise loaded modules, calling their init() functions
  for( var keys in this.modules) {
    moduleEntry = this.modules[keys];
    if( moduleEntry.module.init ) {
      moduleEntry.module.init();
    }
  };


  // Set the template so that it already contains the required CSS and Javascript
  

}


Hotplate.prototype.clientPages = function(options){
  that = this;

  options = options || {};

  var staticUrlRegExp = new RegExp('^' + this.options.staticUrlPath + '/(.*?)/(.*)');

  // root required
  if (!root) throw new Error('static() root path required');

  return function static(req, res, next) {

    // If there is a match...
    var  match = req.path.match( staticUrlRegExp );
    if( match && that.modules[ match[1] ] ){

        var localDir = path.join('hotplate' , that.modulesDir, match[1] , '/client/');

        function error(err) {
          if( 404 == err.status) return next();
          next(err);  
        }
        send(req, match[2] )
         .maxage(options.maxAge || 0)
         .root(localDir)
         .hidden(options.hidden)
         .on('error', error )
         .pipe(res);

    }
  }

};


Hotplate.prototype.renderPage = function(title, bodyContents){
  var r = this.pageTemplate;

  // Replace the title
  r.replace(/(\[\[TITLE\]\])/,title)
  
  // Replace the HEAD
  r = r.replace(/(\[\[HEAD\]\])/, this.renderCss() + '$1');
  r = r.replace(/(\[\[HEAD\]\])/, this.renderJs() + '$1');
  
  
  // Replace the BODY
  r = r.replace(/(\[\[BODY\]\])/, bodyContents + '$1');

  console.log(r);
  return r;
 

}

Hotplate.prototype.Logger = function(entry){
  // FIXME: this will call the right function to do the logging

  // This will need to:
  // Get other registered modules to modify "entry" (in particular, auth will add workspaceName, etc.)
  // Get other registered modules to store the entry (in particular, the module that will offer browsing and filtering options)


  // Allow registered handles to manipulate (most likely enrich) entry
  for(var loggingHandle in this.logginghandles){
    if(this.logginghandles.processEntry){
       this.loggingHandles.processEntry(entry);
    }
  }

  // Get registered handles to store the entry if they want to
  for(var loggingHandle in this.logginghandles){
    if(this.logginghandles.storeEntry){
       this.loggingHandles.storeEntry(entry);
    }
  }
  


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
