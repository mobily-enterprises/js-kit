
/*!
 * Module dependencies.
 */

var util = require('util')
  , path = require('path')
;

/**
 * Jses constructor.
 *
 * An object to which you can add javascript files to, and render them
 *
 * @api public
 */

function Jses(){
  this.jses = [];
  this.Jses = Jses;
}

/**
 * The exports object is the object's constructor
 *
 * @api public
 */

module.exports = exports = Jses;


/**
 * Javascript rendering function.
 *
 * This will return a string which can be dropped into the HEAD of an HTML page
 *
 * @api public
 */

Jses.prototype.render = function(staticUrlPath){
  var r = '';
  this.jses.forEach( function(js){
    r += '<script src="' + path.join( staticUrlPath, js.module, js.path) + '" type="text/javascript"></script>' + "\n";
  });
  return r;
}

/**
 * Add a JS file
 *
 * @param {String} The module's name
 * @param {String} The file's full path
 * @return {Jsses} this
 * @api public
 */

Jses.prototype.add = function(module, path ){
  this.jses.push( { module:module, path: path } );

  return this;
}


