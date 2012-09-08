
/*!
 * Module dependencies.
 */

var util = require('util')
  , path = require('path')
;

/**
 * Csses constructor.
 *
 * An object to which you can add 
 *
 * @api public
 */

function Csses(){
  this.csses = [];
  this.Csses = Csses;
}

/**
 * The exports object is the object's constructor
 *
 * @api public
 */

module.exports = exports = Csses;


/**
 * Css rendering function.
 *
 * This will return a string which can be dropped into the HEAD of an HTML page
 *
 * @api public
 */

Csses.prototype.render = function(staticUrlPath){
  var r = '';
  this.csses.forEach( function(css){
    r += '<link href="' + path.join( staticUrlPath, css.module, css.path) + '" media="screen" rel="stylesheet" type="text/css" />' + "\n";
  });
  return r;
}

/**
 * Add a CSS file
 *
 * @param {String} The module's name
 * @param {String} The file's full path
 * @return {Csses} this
 * @api public
 */

Csses.prototype.add = function(module, path ){
  this.csses.push( { module:module, path: path } );
  return this;
}
