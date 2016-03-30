deepobject
==========

DeepObject is the path to coding heaven where you never have to do this again:


    if( typeof( obj ) === 'object' && object !== null ){
      if( typeof( obj.a ) === 'object' && object.a !== null ){
        if( typeof( obj.b ) === 'object' && object.b !== null ){
          if( typeof( obj.c ) === 'object' && object.c !== null ){
            return obj.a.b.c;
          } else {
            return null;
          }
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }


You write this instead:

    DO.get( obj, 'a.b.c.d', null );


Sounds good? read on.

## Using deepobject with a constructor

This is the best option for objects that you are likely to set once, and query multiple times.

To create a DO object, just run:

    var do = new DO( { a: 10, b: { c: 20, d: 30 } } );

You can then query it for different paths:

    do.get( 'a' ) => 10
    do.get( 'a.b' ) => { c: 20, d: 30 }
    do.get( 'a.b.c' ) => 20
    do.get( 'z', 'something' ) => 'something'

You can also reset the object:

    do.set( { a: 40, b: { c: 50, d: 60 } } );
    do.get( 'a' ) => 40

Finally, you can manipulate the object:

    do.set( 'a.b.d' , 70 ) => 70
    do.get( 'a.b' ) =>  { c: 50, d: 70 }
    do.get( 'a.b.d' ) =>  70

    do.set( 'a.z1.z2.z3', 110 ) => 110
    do.get( 'a.z1.z2.z3' ) => 110

You can manipulate an existing object:

    var o = { a: 10, b: { c: 20, d: 30 } };
    var do = new DO( o );
    do.set( 'a.b.c.d', 10 ) => 10
    do.set( 'a.b.e', 20 ) => 20
    console.log( o ) => { a: { b: { c: { d: 10 }, e: 20 } }, b: { c: 20, d: 30 } }

Can you imagine assigning an object like that by hand?

You can do all of these things without ever worrying about checking if what you are reading is undefined, or worrying about the fact that `null` is `typeof object` and yet will throw errors when you don't want it to.


## Using deepobject as a function on any object (get and set)

DeepObject offers a simple way to do one-time queries:

    var obj = { a: 10, b: { c: 20, d: 30 } };
    DO.get( obj, 'a.b.d' ) => 30
    DO.get( obj, 'a.b.e', 10000 ) => 10000
    DO.set( obj, 'a.b.c', 100 ) => 100

This is handy when you have existing objects are are running one-time queries against it.
