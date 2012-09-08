
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

function Stores( ){
  this.stores = {};
  this.Stores = Stores;
}


/**
 * The exports object is the object's constructor
 *
 * @api public
 */

module.exports = exports = Stores;


/**
 * Variable rendering function.
 *
 * This will return a string which can be dropped into the HEAD of an HTML page.
 * The returned string is javascript code which will create a global variable "vars"
 * with all the values assigned to it.
 *
 * @api public
 */

Stores.prototype.render = function(){
  var r = '';

  r += '<script type="text/javascript">stores = stores || {};</script>' + "\n";
  r += '<script type="text/javascript">';
  for(var storeLocation in this.stores){
    var s = 'stores[\'' + storeLocation + '\']';
    r += s + ' = ' + JSON.stringify(this.stores[storeLocations]) + ';';
    }
  };

  r += '</script>' + "\n";
  return r;
}

/**
 * Add a variable file
 *
 * @param {String} The store's location, e.g. `/app/users`
 * @param {Array} A list of available methods (`get`, `put`, `post`, `delete`)
 * @api public
 */

Stores.prototype.add = function(storeLocation, methods  ){
  this.stores[storeLocation] = methods;
  return this;
}


