"use strict";
/*!
 * Module dependencies.
 */

var dummy
  , hotplate = require('hotplate')
  , path = require('path')
;

function BodyLines(){
  this.data = [];
  this.BodyLines = BodyLines;
}

module.exports = exports = BodyLines;

BodyLines.prototype.render = function(){
  var r = '';
  this.data.forEach( function(item){
    r += '<!-- Added by ' + item.module + " -->\n";
    r += item.line + '\n';
  });
  return r;
}

BodyLines.prototype.add = function( module, line ){
  this.data.push( { module: module, line: line } );

  return this;
}

BodyLines.prototype.concat = function( bodyLines ){
  for( var i = 0, l = bodyLines.data.length; i < l; i ++ ){
    this.add( bodyLines.data[ i ].module, bodyLines.data[ i ].line );
  }
}

