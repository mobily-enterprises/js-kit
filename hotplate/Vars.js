
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

function Vars( ){
  this.vars = {};
  this.Vars = Vars;
}


/**
 * The exports object is the object's constructor
 *
 * @api public
 */

module.exports = exports = Vars;


/**
 * Variable rendering function.
 *
 * This will return a string which can be dropped into the HEAD of an HTML page.
 * The returned string is javascript code which will create a global variable "vars"
 * with all the values assigned to it.
 *
 * @api public
 */

Vars.prototype.render = function(){
  var r = '';

  r += '<script type="text/javascript">vars = vars || {};</script>' + "\n";
  r += '<script type="text/javascript">';
  for(var module in this.vars){
    var vm = 'vars[\'' + module + '\']';
    r += vm + ' = ' + vm + ' || {};';
    for(var name in this.vars[module]){
      var vn = vm + '[\'name\']';
      r += vn + ' = ' + JSON.stringify(this.vars[module][name]) + ';';
    }
  };

  r += '</script>' + "\n";
  return r;
}

/**
 * Add a variable file
 *
 * @param {String} The module's name
 * @param {String} A variable's name
 * @param {String} A variable's value
 * @return {Csses} this
 * @api public
 */

Vars.prototype.add = function(module, name, value  ){
  this.vars[module] = this.vars.module || {};
  this.vars[module][name] = value;

  return this;
}


