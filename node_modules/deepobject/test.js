"use strict";

var DO = require( 'deepobject' );


// Make sure uncaught errors are displayed
process.on('uncaughtException', function(err) {
  console.error(err.stack);
});


var tests = {

  "create and set an object": function( test ){

    var o1 = { a: { b: { c1: 10, c2: 20 } } };
    var d = new DO( o1 );
    test.equal( o1, d.get() );

    var o2 = { a: { b: { c1: 10, c2: 20 } } };
    d.set( o2 );
    test.equal( o2, d.get() );

    test.done();
  },

  "assign and get a deep value": function( test ){

    var o = { a: { b: { c1: 10, c2: 20 } } };
    var d = new DO( o );

    test.equal( d.get( 'a.b.c1'), 10 );
    test.deepEqual( d.get( 'a.b'), { c1: 10, c2: 20 } );
    test.deepEqual( d.get( 'a.b.c.d'), undefined );
    test.deepEqual( d.get( 'a.b.f'), undefined );

    test.done();
  },

  "assign and get a deep value with null in path": function( test ){

    var o = { a: { b: null, c: { c1: 10, c2: 20 } } };
    var d = new DO( o );

    test.equal( d.get( 'a.b.c.d.e'), undefined );
    test.deepEqual( d.get( 'a.b'), null );

    test.done();
  },

  "assign and get a deep value with undefined in path": function( test ){

    var o = { a: { b: undefined, c: { c1: 10, c2: 20 } } };
    var d = new DO( o );

    test.equal( d.get( 'a.b'), undefined );
    test.equal( d.get( 'a.b.c.d.e'), undefined );

    test.done();
  },

  "setting very deep values and getting them": function( test ){
    var o = { a: { b: { c1: 10, c2: 20 } } };
    var d = new DO( o );

    test.equal( d.get( 'a.b.c1'), 10 );
    d.set( 'a.b.c1', 30 );
    test.equal( d.get( 'a.b.c1'), 30 );

    test.equal( d.get( 'a.b.c2'), 20 );
    d.set( 'a.b.c2', { c3: 90, c4: 100 } );
    test.equal( d.get( 'a.b.c2.c4'), 100 );

    d.set( 'a.b.c2', null );
    test.equal( d.get( 'a.b.c2.c4'), undefined );

    test.done();
  },

  "using it with a function": function( test ){
    var o = { a: { b: { c1: 10, c2: 20 } } };

    DO.set( o, 'a.b.c1', 30 );
    test.deepEqual( o, { a: { b: { c1: 30, c2: 20 } } } );
    test.deepEqual( DO.get( o, 'a.b.c2' ), 20 );

    test.done();
  },

}
  
// Copy tests over to exports
for( var i in tests ){
  exports[ i ] = tests[ i ];
}


function l( d, p ){
  console.log('Getting ' + p );
  console.log( require('util').inspect( d.get( p ), { depth: 20 }  )  );
  console.log( '' );
}


