"use strict";
/*!
 * Module dependencies.
 */

var dummy
  , hotplate = require('hotplate')
  , debug = require('debug')('hotplate:hotCorePage:Vars')
;

function Vars( ){
  this.data = {};
  this.Vars = Vars;
}

module.exports = exports = Vars;

Vars.prototype.render = function(){

  var r = '';

  r += '<script type="text/javascript">vars = typeof(vars) !== \'undefined\' ? vars : {};</script>' + "\n";
  r += '<script type="text/javascript">';
  for(var module in this.data){
    var vm = 'vars[\'' + module + '\']';
    r += vm + ' = ' + vm + ' || {};';
    this.data[module].forEach( function(v) {
      var vn = vm + '[\'' + v.name + '\']';
      if( typeof( v.value ) !== 'undefined' )
        r += vn + ' = ' + JSON.stringify(v.value) + ';';
      else
        debug("Problem while writing attribute " + v.name + " of " + vm + " for module " + module + " as it was undefined!" );

    });
  };

  r += '</script>' + "\n";
  return r;
}

/**
 * Add a variable
 *
 * @param {String} The module's name
 * @param {String} A variable's name
 * @param {String} A variable's value
 * @return {Csses} this
 * @api public
 */

Vars.prototype.add = function( module, element ){

  this.data[ module ] = this.data[module] || [];
  this.data[ module ].push( { name: element.name, value: element.value } );

  return this;
}

Vars.prototype.concat = function( vars ){
  for( var module in vars.data ){
    for( var i = 0, l = vars.data[ module ].length; i < l; i ++ ){
      this.add( module, { name: vars.data[ module ][ i ].name, value: vars.data[ module ][ i ].value } );
    }
  }
}
