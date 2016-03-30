simpleDeclare
=============

SimpleDeclare is the Holy Grail of OOP implementation in Javascript, working _with_ Javascript rather than against it. Highlights:

* Works in strict mode (!)
* Well written, and well commented, code
* Works both as a CommonJS module and as a RequireJS module
* Works with IE9 up
* Works with Javascript, as close to the metal as possible, with possibility to inherit from normal Javascript constructors
* Single inheritance and multiple inheritance
* Strong implementation of `this.inherited(fn, arguments)` (works the same way ECMA6 will eventually give us). Yes, _in strict mode_!
* Easy calling of asyncronous super methods with `this.inheritedAsync()`
* Automatic execution of all constructors in the right order
* Automatic inheritance of class-wide methods (they are copied over)
* `extend()` method available to extend specific SimpleDeclare constructors 
* Bare minimum amounts of meta-data (in fact, only `OriginalConstructor`) and minimum amount of prototype pollution
* Fully unit-tested and currently used as the foundation in [Hotplate](https://github.com/mercmobily/hotplate) as most of Hotplate's foundation modules

# Simple inheritance from Object

````Javascript
    var A = declare( Object, {
      method1: function( parameter ){
        console.log("A::method1() called!")
      },
    })

    var a = new A();

    console.log( A.prototype ); 
    /* =>
    { method1: [Function],
      inherited: [Function],
      inheritedAsync: [Function],
      instanceOf: [Function],
      getInherited: [Function] }
    */

    a.method1(); // => A::method1() called!
    console.log( a.__proto__ === A.prototype ); // => true
    console.log( a instanceof A ); // => true
    console.log( A.extend ); // => [Function]
````

This is the simplest way to create a constructor function: the first parameter, `Object`, tells SimpleDeclare that you are inheriting from `Object` (Javascript's basic class). The second parameter contains the methods that will be added to the constructor's prototype.
You can see that `A`'s prototype also contains extra methods: 

* `inherited()` and `inheritedAsync()` (which will call `method1()` of the parent);
* `instanceOf()` (which checks if an object is the instance of a constructor, even when using multiple inheritance -- more about this later);
* `getInherited()` (returns the corresponding function in the parent).

## Shorthand syntax when deriving from `Object`

When deriving from `Object`, you can just pass the mixin to simpleDeclare, omitting `Object` as the first parameter: 

````Javascript
    var A = declare( {
      method1: function( parameter ){
        console.log("A::method1() called!")
      },
    })

    var a = new A();
````
In the documentation, for clarity's sake, I will use the full syntax `var A = declare( Object, { ... } );`. However, in real programs you will probably want to use the shorthand version `var A = declare( { ... } );`. The result of the two calls is identical.

# Simple inheritance from Object with initialisation function

````Javascript
    var A = declare( Object, {
      constructor: function( p ){
        console.log("A's constructor called with parameter: " + p )
      },

      method1: function( parameter ){
        console.log("A::method1() called!")
      },
    })

    var a = new A( 10 ); // => A's constructor called with parameter: 10
    a.method1(); // => A::method1() called!
````

Here, a `constructor` attribute is passed: it will be called every time a new instance of A() is created. This is very handy to add initialisation code to your constructors.

# Simple inheritance from another constructor

````Javascript
    var A = declare( Object, {

      name: 'A',

      constructor: function( p ){
        console.log("A's constructor called with parameter: " + p )
      },
 
      method1: function( parameter ){
        console.log("A::method1() called")
      },

      method2: function( parameter ){
        console.log("A::method2() called")
      },
    })

    var B = declare( A, {

      name: 'B',

      constructor: function( p ){
        console.log("B's constructor called with parameter: " + p )
      },
 
      method1: function( parameter ){
        console.log("B::method2() called");
      }
    })

    var a = new A( 10 ); // => A's constructor called with parameter: 10
    a.method1(); // => A::method1() called
    a.method2(); // => A::method2() called

    var b = new B( 11 );
    /* =>
    B's constructor called with parameter: 11
    A's constructor called with parameter: 11
    */

    console.log( b instanceof A ); // => true

    b.method1(); // => B::method1() called

    console.log( a.__proto__ );
    /* =>
    { name: 'A',
      method1: [Function],
      method2: [Function],
      inherited: [Function],
      inheritedAsync: [Function],
      instanceOf: [Function] }
    */
    console.log( a.__proto__.__proto__ ); // => {}
    console.log( a.__proto__.__proto__.constructor === Object ); // true

    console.log( b.__proto__ ); // => { name: 'B', method1: [Function] }
    console.log( b.__proto__.__proto__ );
    /* =>
    { name: 'A',
      method1: [Function],
      method2: [Function],
      inherited: [Function],
      inheritedAsync: [Function],
      instanceOf: [Function] }
    */
    console.log( b.__proto__.__proto__.constructor === A ); // => true
    console.log( b.__proto__.__proto__.__proto__ ); // => {}
    console.log( b.__proto__.__proto__.__proto__.constructor === Object ); // => true 
````

Note that the attribute `name` is only here so that you can clearly recognise which prototype you're looking at. It has no special meaning for SimpleDeclare itself.

Also note that when running `new B()`, _both_ constructors are run, in the right order. This means that when you define a constructor with simpleDeclare you can rest assured that _every_ initialisation function passed as `constructor` will actually be run (with the parameters passed to `B()` ).

The `b` variable is recognised as `instanceof`, as it should.

# Calling the super function with `this.inherited()`

A inherited constructor will often redefine a method; you will often want to run the "super" method that was redefined. SimpleDeclare makes this very possible, offering a very robust implementation of `this.inherited()`:

````Javascript
    var A = declare( Object, {

      name: 'A',

      method1: function( parameter ){
        console.log("A::method1() called")
      },

      method2: function( parameter ){
        console.log("A::method2() called")
      },
    })

    var B = declare( A, {

      name: 'B',
 
      method1: function f( parameter ){
        console.log("B::method1() called, now calling the 'super' method");
        this.inherited( f, arguments );
      }
    })

    var b = new B();

    b.method2(); // => B::method2() called

    b.method1();
    /* =>
    B::method1() called, now calling the 'super' method
    A::method1() called
    */
````    

The `this.inherited()` method is available to any object created by a SimpleDeclare constructor. The first parameter is always a reference to the function calling it. When using `this.inherited()`, a common pattern is to name the function `f` and always pass `f` as the first argument of `this.inherited()`. This extra parameter is what makes SimpleDeclare work in safe mode (`this.inherited()` itself doesn't need to find out what its `callee` is, and checking out `callee` is forbidden in safe mode). The second parameter is an array of values, representing the parameters to pass to the super function. Its implementation is very fast (the only CPU-intensive operation is looking for the method itself in the object's own list of prototypes). When ECMA 6 becomes the standard, in an hopefully not-so-distant future, even this step will be immediate.  

# Calling the super function with node-style callback

Calling the super function is just a matter of typing `this.inherited(f, arguments)`. What if the super function is a node-style async method that accepts a callback as its last parameter? Simple:


````Javascript
  var A = declare( Object, {

      name: 'A',

      method1: function( parameter, cb ){
        console.log( "A::method1() called, parameter: ", parameter );
        cb( null, "Returned by A::method1" );
      },

      method2: function( parameter, cb ){
        console.log("A::method2() called, parameter: ", parameter );
        cb( null, "Returned by A::method2" );
      },
    })

    var B = declare( A, {

      name: 'B',
 
      method1: function f( parameter, cb ){
        console.log( "B::method1() called with parameter: ", parameter );
        console.log( "Now calling inherited method...");
        this.inheritedAsync( f, arguments, function( err, res ){

          // Error in the inherited function: propagate err, node style
          if( err ) return cb( err );

          console.log( "Parent function returned:", res );
          cb( null, "Returned by B::method1" );
        });
      }
    })

    var b = new B();

    
    b.method1( 'test parameter', function( err, res ){
      /* =>
      B::method1() called with parameter:  test parameter
      Now calling inherited method...
      A::method1() called, parameter:  test parameter
      Parent function returned: Returned by A::method1
      */

      console.log( "b.method 1 returned:", res );
      /* =>
      b.method 1 returned: Returned by B::method1
      */
    });
````    

`B::method1()` follows Node's callback standards: the last parameter is a callback, which is expected to be called with two parameters: `err` (an `Error` object if there was an error) and the returned value.

The `this.inheritedAsync()` function accepts two arguments: the `arguments` array, and a new callback. What will actually happen, is that the super method will be called by `inheritedAsync()` with a modified version of `arguments`: a version where the last parameter is changed to the new callback.

This is the easiest possible way to override node-style methods.

# Inheriting from "pure" constructor functions

You can use SimpleDeclare to inherit from constructor functions.

For example:

````Javascript

   // Nice SimpleDeclare class
   var A = declare( Object, {

      name: 'A',

      method1: function( parameter ){
        console.log( "A::method1() called, parameter: ", parameter );
        return "Returned by A::method1";
      },
      constructor: function( parameter ){
        console.log( "A's constructor called!" );
      }
    });
    A.classMethod = function(){
      console.log( "This is A's method")
    }

    // Plain vanilla class (ugly!)
    var B = function(){
      console.log("B's constructor called!");
    }
    B.prototype = Object.create( A.prototype, {
      constructor: {
        value: B,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    B.prototype.name = "B";

    // Nice SimpleDeclare class
    var C = declare( B, {

      name: 'C',

      constructor: function( parameter ){
        console.log( "C's constructor called!" );
      }

    })

    var c = new C();
    /* =>
    A's constructor called!
    B's constructor called!
    C's constructor called!
    */
    c.method1( 10 ); // => A::method1() called, parameter:  10
````

As you can see, everything works 100% fine: all constructors run in the right order.
What actually happens behind the scenes is that SimpleDeclare's standard constructor function will go through the whole prototype chain starting from the innermost element, and will execute every constructor one after the other.

# Simple inheritance using `extend()`

Each constructor returned by SimpleDeclare comes with an `extend()` method that allows you to inherit from it.
For example:

````Javascript
    var A = declare( Object, {
      method: function(){
        console.log( "Hello" );
      }
    });

    var B = A.extend( {
      method: function(){
        console.log( "A MUCH BETTER hello!" );
      }
    })
````

# Multiple inheritance

You can easily inherit from multiple constructors:

````Javascript
   var A1 = declare( Object, {
      name: 'A1',
      method1: function f( parameter ){
        console.log( "A1::method1() called, parameter: ", parameter );
        this.inherited( f, arguments);
        return "Returned by A1::method1";
      },
    });

   var A2 = declare( Object, {
      name: 'A2',
      method1: function f( parameter ){
        console.log( "A2::method1() called, parameter: ", parameter );
        this.inherited( f, arguments);
        return "Returned by A2::method1";
      },
    });

   var A3 = declare( Object, {
      name: 'A3',
      method1: function f( parameter ){
        console.log( "A3::method1() called, parameter: ", parameter );
        this.inherited( f, arguments);
        return "Returned by A3::method1";
      },
    });

   var AA1 = declare( [ A1, A2, A3 ], {
      name: 'AA1',
      method1: function( parameter ){
        console.log( "AA1::method1() called, parameter: ", parameter );
        this.inherited(arguments);
        return "Returned by AA1::method1";
      },
   })

   var AA2 = declare( A1, A2, A3, {
      name: 'AA2',
      method1: function( parameter ){
        console.log( "AA2::method1() called, parameter: ", parameter );
        this.inherited(arguments);
        return "Returned by AA2::method1";
      },
   })

  var aa1 = new AA1();
  aa1.method1( 10 );
  /* =>
  AA1::method1() called, parameter:  10
  A3::method1() called, parameter:  10
  A2::method1() called, parameter:  10
  A1::method1() called, parameter:  10
  */

  console.log( aa1 instanceof A1 ); // => false
  console.log( aa1 instanceof A2 ); // => false
  console.log( aa1 instanceof A3 ); // => false

  console.log( aa1.instanceOf( A1 ) ); // => true
  console.log( aa1.instanceOf( A2 ) ); // => true
  console.log( aa1.instanceOf( A3 ) ); // => true
````

You can achieve multiple inheritance either by passing an array as first argument and the prototype as second argument( `var AA1 = declare( [ A1, A2, A3 ], { ... } );`) or by passing a list of constructors, with the prototype as the last parameter (`var AA2 = declare( A1, A2, A3, { ... } );`). The two forms are completely equivalent. The type of the last parameter passed to `declare()` is checked: if it's a function, it will be treated as a constructor to inherit from; if it's a simple non-null object, it will be treated as the prototype. This means that these two forms are totally equivalent:

    var AA1 = declare( [ A1, A2, A3 ], { ... } );
    var AA2 = declare( A1, A2, A3, { ... } );

Note also that the second parameter is optional. So, you can do:

    var AA1 = declare( [ A1, A2, A3 ] );
    var AA2 = declare( A1, A2, A3 );

Note that when you use multiple inheritance (that is, when the first parameter passed to declare is an array, and the array has more than 1 element), the resulting constructor `AA` won't have `A1`, `A2` and `A3` in its prototype chain, but _copies_ of them. This means that Javascript's native `instanceof` will not work -- you will have to use the object's `instanceOf()` method instead.

It's important to remember that you are only dealing with copies, especially if you expect `AA`'s behaviour to change if you chance `A1`'s own prototype (which won't happen, as `AA` only ha a _copy_ of `A1`).

This is very rarely a problem (if ever). In fact, it can be considered a bonus in case you want to make prototype-specific changes to `AA` and want to rest assured that none of the original constructor's prototypes are actually changed.

# Duplicate base constructors and multiple inheritance

When using multiple inheritance, SimpleDeclare will never allow you to have a the same constructor twice in the prototype chain. The results of it could potentially be catastrophic (loops when calling `this.inherited()` or when running the constructors, or methods called twice, etc.).

When using multiple inheritance, SimpleDeclare will:

* for each `constructor` to inherit from (first parameter of `declare()`):
 * make a  flattened list `subList` of _all_ prototypes found in the prototype chain of the constructor, ordered from the deepest to the outest
 * add each element of `subList` to `masterList` _if it's not already there_
* create a new constructor with a prototype chain matching `masterList`, crearing copies of the required prototypes to make such a chain
* use the newly created constructor as the bases for the newly created constructor, which will include the properties in the second parameter passed to `declare()`.

In simple terms, this means that:

* Each passed constructor passed as first parameter to `declare()` is broken down into all if its constructors/prototypes
* The final object will be a mix of all of these prototypes/constructors, _left to right_
* If a constructor/prototype was already found, it will not get added again.

Let me explain with some code:

````Javascript
    var A1 = declare( Object, {
      name: 'A1',
      method1: function f( parameter ){
        console.log( "A1::method1() called, parameter: ", parameter );
        this.inherited( f, arguments );
        return "Returned by A1::method1";
      },
    });

    var A2 = declare( Object, {
      name: 'A2',
      method1: function( parameter ){
        console.log( "A2::method1() called, parameter: ", parameter );
        this.inherited( f, arguments );
        return "Returned by A2::method1";
      },
    });

    var A3 = declare( Object, {
      name: 'A3',
      method1: function f( parameter ){
        console.log( "A3::method1() called, parameter: ", parameter );
        this.inherited( f, arguments );
        return "Returned by A3::method1";
      },
    });

    var AA = declare( [ A1, A2, A3 ], {
      name: 'AA', 
      method1: function f( parameter ){
        console.log( "AA::method1() called, parameter: ", parameter );
        this.inherited( f, arguments );
        return "Returned by AA::method1";
      },
    });

    var B = declare( Object, {
      name: 'B', 
      method1: function f( parameter ){
        console.log( "B::method1() called, parameter: ", parameter );
        this.inherited( f, arguments );
        return "Returned by B::method1";
      },
    });


    var L = declare( Object, {
      name: 'L',
      method1: function f( parameter ){
        console.log( "L::method1() called, parameter: ", parameter );
        this.inherited( f, arguments );
        return "Returned by L::method1";
      },
    });

    var D = declare( [ A1, A2, B ], {
      name: 'D',
      method1: function( parameter ){
        console.log( "D::method1() called, parameter: ", parameter );
        this.inherited( f, arguments );
        return "Returned by D::method1";
      },
    });

    var M = declare( [ AA, L, D ], {
      name: 'M'
    } )

    // Make up a new object
    var m = new M();
    m.name = "OBJECT M";

    // Print the prototype chain
    var p = m;
    while( p != null ){
      console.log( p.name );
      p = p.__proto__;
    }
    /* =>
    OBJECT M
    M
    D
    B
    L
    AA
    A3
    A2
    A1
    undefined
    */
````

Here, keep in mind that:

* `A1`, `A2`, `A3`, `B` and `L` are basic constructors deriving from Object
* `AA` derives from `[ A1, A2, A3 ]` (all basic constructors)
* `D` derives from `[ A1, A2, B ]` (all basic constructors)
* `M` derives from `[ AA, L, D ]`.

Note: this example is convoluted. In real life, you will hopefully never see this. SimpleDeclare avoids duplication as a failsafe mechanism -- ideally you won't inherit twice from the same constructor.

While `AA` and `D` are very straightforward, since all of the starting points are flat.
However, `M` is interesting: it inherits from `AA` (which includes `A1`, `A2` and `A3`), `L` and then `D` (which overlaps with `AA` for `A1` and `A2`). So, what happens here?

SimpleDeclare uses the principle of least surprise: inheritance will happen left to right, without repeating constructors that have already been applied.

So: first of all, `AA` is checked, and it's expanded into `[ AA, A3, A2, A1 ]` and added to the main list. Note that the order determines their precedence: this makes sense, since a `method1()` defined in `AA` will override the one set in `A3`. The next element is `L`: it's not in the main list already, so it's added. The main list becomes `[ L, AA, A3, A2, A1 ]`. Then it's interesting: `D` needs to be added. `D` itself expands into `[ D, B, A2, A1 ]`. However, `A1` and `A2` are already present in the big list (which is, I remind you, `[ L, AA, A3, A2, A1 ]`). So, only the elements in `D` that don't overlap, namely `D` itself and `B`. So, the main list now is  `[ D, B, L, AA, A3, A2, A1 ]`. `M` obviously needs to be in the prototype chain: it will have the second argment passed to `declare()` as its prototype template. So, the final prototype chain will be `[ M, D, B, L, AA, A3, A2, A1 ]`. Note that only `M` is a proper new constructor: the others are all clones of the respective ones, so that `M` inherits from the right ones.

If you wanted to sum up how this works in one sentence, this esentence would be: "In multiple inheritance, copies of the constructors are added left to right, including constructors in prototype chains, without ever adding the same constructor twice". In this case, `A1` and `A2` were already duplicate by the time we got to `D`, which is why `A1` and `A2` were ignored.


# Multiple inheritance using `extend()`

You can use `extend()` for multiple inheritance too. For example:

````Javascript
var M1 = declare( Object, {
      name: 'M1',
      method1: function f( parameter ){
        console.log( "M1::method1() called, parameter: ", parameter );
        this.inherited(f, arguments );
        return "Returned by M1::method1";
      },
    });

    var M2 = declare( Object, {
      name: 'M2',
      method1: function f( parameter ){
        console.log( "M2::method1() called, parameter: ", parameter );
        this.inherited( f, arguments );
        return "Returned by M2::method1";
      },
    });

    var A = declare( Object, {
      name: 'A',
      method1: function( parameter ){
        console.log( "A::method1() called, parameter: ", parameter );
        this.inherited( f, arguments );
        return "Returned by A::method1";
      },
    });


    var B = A.extend( [ M1, M2 ], {
      name: 'B', 
      method1: function( parameter ){
        console.log( "B::method1() called, parameter: ", parameter );
        this.inherited( f, arguments );
        return "Returned by B::method1";
      },
    })

    // Make up a new object
    var b = new B();
    b.name = "OBJECT B";

    // Print the prototype chain
    var p = b;
    while( p != null ){
      console.log( p.name );
      p = p.__proto__;
    }
    /* =>
    OBJECT B
    B
    M2
    M1
    A
    undefined
    */
````

Note that `B` will be based on an object that can be seen as `A` plus `M1` plus `M2`.
Also, just like in `extend()`, the following forms are totally equivalent:

    var B = A.extend( [ M1, M2 ], { ... } );
    var B = A.extend( M1, M2, { ... } );

Just like in `declare()`, you can also omit the prototype:

    var B = A.extend( [ M1, M2 ] );
    var B = A.extend( M1, M2 );

# Syntax summary

As you can see, simpleDeclare is very resiliant in terms of what parameters can be passed to it.
Here is a summary of all possible forms:

## `declare()`

  * `var T1 = declare();`: Inherits from `Object`. Single inheritance.
  * `var T2 = declare( { name: 'T2' } );`: Inherits from `Object`, prototype has `name`. Single inheritance.
  * `var T3 = declare( A1 );`: Inherits from `A1`, with empty prototype. Single inheritance.
  * `var T4 = declare( [ A1, A2, A3 ] );`: Inherits from `A1, A2, A3`, with empty prototype. Multiple inheritance.
  * `var T5 = declare( [ A1, A2 ], { name: 'T5' } );`: Inherits from `A1, A2`, prototype has `name`. Multiple inheritance.
  * `var T6 = declare( A1, { name: 'T6' } );`: Inherits from `A1`, prototype has `name`. Single inheritance.
  * `var T7 = declare( A1, A2, { name: 'T7' } );`: Inherits from `A1, A2`, prototype has `name`. Multiple inheritance.
  * `var T8 = declare( A1, A2, A3 );`: Inherits from `A1, A2, A3`, with empty prototype. Multiple inheritance.

## `extend()`

  * `var T1 = A1.extend();`: Inherits from `A1`, with empty prototype. Single inheritance.
  * `var T2 = A1.extend( { name: 'T2' } );`: Inherits from `A1`, prototype has `name`. Single inheritance.
  * `var T3 = A1.extend( A2 );`: Inherits from `A1, A2`, with empty prototype. Multiple inheritance.
  * `var T4 = A1.extend( [ A2, A3 ] );`: Inherits from `A1, A2, A3`, with empty prototype. Multiple inheritance. 
  * `var T5 = A1.extend( [ A2, A3 ], { name: 'T5' } );`: Inherits from `A1, A2, A3`, prototype has `name`. Multiple inheritance.
  * `var T6 = A1.extend( A2, { name: 'T6' } );`: Inherits from `A1, A2`, prototype has `name`. Multiple inheritance.
  * `var T7 = A1.extend( A2, A3, { name: 'T7' } );`: Inherits from `A1, A2, A3`, prototype has `name`. Multiple inheritance.
  * `var T8 = A1.extend( A2, A3, A4 );`: Inherits from `A1, A2, A3, A4`, prototype has `name`. Multiple inheritance.

# (Not much) Under the hood

SimpleDeclare works with Javascript as much as possible. There is only a small level of trickery used to make things work.

### Attributes to returned constructors

Each constructor has the following attributes:

#### `extend()`

This is a function that is attached to each constructor returned. This allows you to create a new constructor "extending" an existing one.

#### `OriginalConstructor`

When using SimpleDeclare's multiple inheritance features, each constructor is actually cloned and placed in a ad-hoc prototype chain that depends on the second parameter of `declare()`. Each cloned constructor will have an `OriginalConstructor` attribute. This attrbute is basically never used directly (since developers never need direct access to those constructors). However, it's necessary for SimpleDeclare so that 1) Duplication in the prototype chain is avoided properly 2) The `instanceOf()` method can work properly (see below).

### Attributes to returned constructors' prototype (available to objects)

When creating a constructor, a number of parameters are made available to the prototpe _if they weren't already available_ (so, unnecessary pollution is avoided).

Here they are.

#### `getInherited( fn )`

Returns the inherited function from the parent prototype, without running it

#### `inherited( f, arguments )`

Runs the inherited function from the parent prototype

#### `inheritedAsync( f, arguments)`

Runs the inherited function from the parent prototype (asynchronous fashion)

#### `instanceOf( Ctor )`

Checks if the current object is anywhere in Ctor's prototype chain. NOTE: to determine descendance, it checks the prototype chain also checking for OriginalConstructor in each case, so that checking on mixin works properly. 
