"use strict";
/*!
 * Module dependencies.
 */

var dummy
  , hotplate = require('hotplate')
  , path = require('path')
;

function Csses(){
  this.data = [];
  this.Csses = Csses;
}

module.exports = exports = Csses;

Csses.prototype.render = function(){
  var r = '';
  this.data.forEach( function( css ){
    r += '<link href="' + path.join( hotplate.config.get('hotplate.moduleFilesPrefix'), css.module, css.fileLocation) + '" media="screen" rel="stylesheet" type="text/css" />' + "\n";
  });
  return r;
}

Csses.prototype.add = function( module, fileLocation ){
  this.data.push( { module:module, fileLocation: fileLocation } );
  return this;
}


Csses.prototype.concat = function( csses ){
  for( var i = 0, l = csses.data.length; i < l; i ++ ){
    this.add( csses.data[ i ].module, csses.data[ i ].fileLocation );
  }
}


