"use strict";
/*!
 * Module dependencies.
 */

var dummy
  , hotplate = require('hotplate')
  , path = require('path')
;

function TitleWords(){
  this.data = [];
  this.TitleWords = TitleWords;
}


module.exports = exports = TitleWords;

TitleWords.prototype.render = function(){
  return this.data.join( ' ' );
}

TitleWords.prototype.add = function( module, word ){
  this.data.push( word );

  return this;
}

TitleWords.prototype.concat = function( titleWords ){
  for( var i = 0, l = titleWords.data.length; i < l; i ++ ){
    this.add( '', titleWords.data[ i ] );
  }
}

