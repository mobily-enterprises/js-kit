"use strict";
/*!
 * Module dependencies.
 */

var dummy
  , hotplate = require('hotplate')
  , path = require('path')
;

function HeadLines(){
  this.data = [];
  this.HeadLines = HeadLines;
}

module.exports = exports = HeadLines;


HeadLines.prototype.render = function(){
  var r = '';
  this.data.forEach( function(item){
    r += item.line + '<!-- Added by ' + item.module + " -->\n";
  });
  return r;
}

HeadLines.prototype.add = function(module, line ){
  this.data.push( { module: module, line: line } );

  return this;
}

HeadLines.prototype.concat = function( headLines ){
  for( var i = 0, l = headLines.data.length; i < l; i ++ ){
    this.add( headLines.data[ i ].module, headLines.data[ i ].line );
  }
}

