/*
 * Module dependencies.
 */

var dummy
, declare = require("simpledeclare")
;


// Create the enhanced EventEmitter
var DeepObject = exports = module.exports = declare( Object, {

  constructor: function( obj ){
    this._setObj( obj );
  },

  _setObj: function( obj ){

    // If obj wasn't passed, then just init the object
    // with an empty object
    if( typeof( obj ) === 'undefined' ){
      this.obj = {};

    // A parameter was passed. Check it, assign it
    } else {

      // If it wasn't an object, throw an error and fail
      if( typeof( obj ) !== 'object' ){
        throw( new Error("Deepobject's initial object needs to be of type Object") );
        this.obj = {};

      // It was an object: nearly there
      } else {

        // In JS, null happens to be an object. Will need to fail if null is passed
        if( obj === null ){
          throw( new Error("Deepobject's initial object cannot be 'null'") );
          this.obj = {};

        // Nothing short of a miracle: it's an actual object, and it's not null!
        } else {
          this.obj = obj;
        }
      }
    }
    return obj;
  },

  get: function( path, defaultValue ){

    // No path passed: return the whole object
    if( typeof( path ) === 'undefined' ){
      return this.obj;
    } else {

      // The `path` parameter was passed: fetch the specific value
      var obj = this.obj;
      var parts = path.split('.');
      for(var i = 0, l = parts.length; i < l; i++) {
          var part = parts[ i ];
          if( obj !== null && typeof( obj ) === "object" && part in obj ) {
              obj = obj[ part ];
          }
          else {
            return defaultValue;
          }
      }
      return obj;
    }
  },


  set: function( path, value ){

    // Only one parameter: set the whole object
    if( typeof( value ) === 'undefined' ){
      value = path;
      this._setObj( value );

    // The `path` parameter was passed: set the specific value
    } else {

      var obj = this.obj;
      var parts = path.split( '.' );
      for( var i = 0, l = parts.length; i < l -1; i++ ){
        var part = parts[ i ];

        // If it's not already a (not null) object, then turn it into one
        if( typeof( obj[ part ]  ) !== "object" || obj[ part ] === null ){
          obj[ part ] = {};
        }

        // Follow on
        obj = obj[ part ];
      }
      // Loop is over, assign it
      obj[ parts[ l - 1 ] ] = value;
    }

    // Return the set value. Chaining would be pointless
    return value;

  },


});

DeepObject.get = function( obj, path, defaultValue ){
  o = new DeepObject( obj );
  return o.get( path, defaultValue );
}

DeepObject.set = function( obj, path, value ){
  o = new DeepObject( obj );
  return o.set( path, value );
}


/*
    var o = { a: 10, b: { c: 20, d: 30 } };
    console.log("Object:");
    console.log( o );
    var dobj = new DeepObject( o );
    dobj.set( 'a.b.c.d', 10 );
    dobj.set( 'a.b.e', 20 );
    console.log("Object after manipulation:");
    console.log( require('util').inspect( o, { depth: 10 } ) );
*/

/*
function l( d, p ){
  console.log('Getting ' + p );
  console.log( require('util').inspect( d.get( p ), { depth: 20 }  )  );
  console.log( '' );
}

var d = new DeepObject( { a: { b: { c1: 10, c2: 20 } } } );

l( d );
l( d, 'a' );
l( d, 'a.b' );
l( d, 'a.b.c1' );
l( d, 'a.b.c3' );
l( d, 'z', "hello" );

d.set( 'a.b.c3', 100 );
l( d );
d.set( 'a1', 110 );
l( d );

d.set( 'z.z.z.z.z.z.z.z.z.z', 120 );
l( d );

d.set( 'z.z.z', null );
l( d );

d.set( 'z.z.z.z.z', 150 );
l( d );
*/
