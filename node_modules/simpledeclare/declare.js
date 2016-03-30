    /*
    Copyright (C) 2015 Tony Mobily

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    */

    (function ( define ){

      "use strict";
      /*jslint node: true */

      define( function( require, exports, module ){

        function getObjectBase( o, fn ){

          var found = false, currentPoint = o;
          var k, i, l;
          
          while( currentPoint ){

            var objMethods = Object.getOwnPropertyNames( currentPoint );
            for( i = 0, l = objMethods.length; i < l; i ++ ){
              k = objMethods[ i ];

              if( currentPoint.hasOwnProperty( k ) && currentPoint[ k ] === fn ){
                found = true;
                break;
              }
            }
            // If found, break out of the cycle. Otherwise, keep looking in the next proto up
            if( found ) break;
            currentPoint = Object.getPrototypeOf( currentPoint );
          }

          // Return crrentPoint. Note that if the search was unsccessful,
          // currentPoint will be `null`
          return { base: currentPoint, key: k };
        }

        // This will become a method call, so `this` is the object
        var getInherited = function( fn ){

          // Get the object's base 
          var objectBase = getObjectBase( this, fn );

          // If the function is not found anywhere in the prototype chain
          // there is a pretty big problem
          if( ! objectBase.base ) throw new Error( "inherited coun't find method in chain (getInherited)" );

          // At this point, I know the key. To look for the super method, I
          // only have to check if one of the parent __proto__ has a matching key `k`
          var p = Object.getPrototypeOf( objectBase.base );
          return p[ objectBase.key ]; 
        };


        var makeInheritedFunction = function( type ){

          // This will become a method call, so `this` is the object
          return function( fn, args, cb ){

            // Get the inherited function
            var fnUp = this.getInherited( fn );

            // No inherited function in the chain, just call the callback (async) or return nothing
            if( ! fnUp  ){
              if( type === 'async' ) return cb.call( this, null );
              if( type === 'sync' ) return;
            }

            // Call the function. It could be sync or async
            if( type == 'async' ){
              var argsMinusCallback = Array.prototype.slice.call(args, 0, -1 ).concat( cb );
              return fnUp.apply( this, argsMinusCallback );
            } else {
              return fnUp.apply( this, args );
            }
          };
        };

        // This will be added as a Constructor-wide method
        // of constructor created with simpleDeclare (only if needed)
        var extend = function(){

          // Normalise the arguments passed
          var r = workoutDeclareArguments( arguments );
          r.SuperCtorList.unshift( this );

          // Will run declare with the 2-parameter signature
          return declare( r.SuperCtorList, r.protoMixin );
        };


        // Look for Ctor.prototype anywhere in the __proto__ chain.
        // Unlike Javascript's plain instanceof, this method attempts
        // to compare 
        var instanceOf = function( Ctor ){

          var searchedProto = Ctor.OriginalConstructor ? Ctor.OriginalConstructor.prototype : Ctor.prototype;
          var current = this;
          var compare;

          while( ( current = Object.getPrototypeOf( current ) ) ){

            // It will compare either with OriginalConstructor.prototype or plain prototype
            compare = current.constructor.OriginalConstructor ?
                      current.constructor.OriginalConstructor.prototype :
                      current.constructor.prototype;

            // Actually run the comparison
            if( compare === searchedProto ) return true;
          }
          return false;
        };
          
        var makeConstructor = function( FromCtor, protoMixin, SourceOfProto ){

          var ActualConstructor;

          var ReturnedCtor = function(){

            // The object's main constructor is being run. It will be responsible of
            // running all of the constructors in the prototype chain, starting from
            // the innermost and moving all the way out, except the last one
            // (which is itself) 
            if( Object.getPrototypeOf( this ).constructor === ReturnedCtor ){

              // Goes through the prototype chain and execute every single constructor.
              var l = [];
              var o = this;
              while( ( o = Object.getPrototypeOf( o ) ) ){
                l.push( o.constructor );
              }
              for( var i = l.length - 1; i >=1; i -- ){
                l[ i ].apply( this, arguments );
              }
            }

            // Itself. Since I *know* this is a SimpleDeclare constructor,
            // run ActualConstructor if available
            if( ActualConstructor ) ActualConstructor.apply( this, arguments );
          };
          
          // protoMixin MUST be a valid, not-null object
          if( typeof( protoMixin ) !== 'object' || protoMixin === null) protoMixin = {};
          
          // Create the new function's prototype. It's a new object, which happens to
          // have its own prototype (__proto__) set as the superclass' prototype and the
          // `constructor` attribute set as FromCtor (the one we are about to return)
          ReturnedCtor.prototype = Object.create(FromCtor.prototype, {
            constructor: {
              value: ReturnedCtor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });

          // Copy every element in protoMixin into the prototype.
          // Note that `constructor` is special: it's _not_ copied over.
          // Instead, it's placed in ReturnedCtor.ActualConstructor.
          // It can either come:
          //   * from protoMixin, in cases where SourceOfProto is not defined
          //     (which means that it's what the developer passed herself in `protoMixin` as `constructor`)
          //   * from the source of protoMixin, in cases where SourceOfProto is defined
          //     (which means that we are taking it from the SourceOfProto, since the goal
          //      is to mimic it completely creating a working copy of the original constructor)
          var ownProps = Object.getOwnPropertyNames( protoMixin );
          for( var i = 0, l = ownProps.length; i < l; i ++ ){
            var k = ownProps[ i ];

            if( k !== 'constructor' ) ReturnedCtor.prototype[ k ] = protoMixin[ k ]; 
          }

          // We are not cloning a constructor, but creating a brand new one (using protoMixin as
          // a source of methods that just got added to the prototype).
          // ActualConstructor will be set to the `constructor` property of protoMixin
          if( ! SourceOfProto ){
            if( protoMixin.hasOwnProperty( 'constructor' ) ) ActualConstructor = protoMixin.constructor;
          }

          // We are in the process of cloning an existing constructor.
          // When doing that:
          // * ReturnedCtor's ActualConstructor will be set to the Source's ActualConstructor.
          //   This will ensure that the stock constructor (that just invokes ActualConstructor) works.
          // * ReturnedCtor's OriginalConstructor will be set to the Source's ActualConstructor (or the souce itself).
          //   This will ensure that we have a path to the actual constructor we actually cloned,
          //   so that instanceOf() will work (by checking ActualConstructor whenever possible)
          if( SourceOfProto ){
            ActualConstructor = SourceOfProto;
            ReturnedCtor.OriginalConstructor = SourceOfProto.OriginalConstructor || SourceOfProto;
          }

          // That's it!
          return ReturnedCtor;
        };

        var copyClassMethods = function( Source, Dest ){

          // Source class needs to be a function
          if( typeof( Source) !== 'function' ) throw new Error("Error: source constructor must be a function");

          // Copy class methods over, EXCEPT if it's Object (the base class) which is ALWAYS
          // gracefully ignored
          if( Source !== Object ){

            var ownProps = Object.getOwnPropertyNames( Source );
            for( var i = 0, l = ownProps.length; i < l; i ++){
              var property = ownProps[ i ];

              // This statement is there so that strict mode still works -- even accessing these
              // automatically like this will cause an error!
              if( property !== 'arguments' && property !== 'callee' && property !== 'caller' ){

                // It's one of the attributes' in Function()'s prototype: skip
                if( Function.prototype[ property ] === Source[ property ] || property === 'prototype' ) continue;
                // It's one of the attributes managed by simpleDeclare: skip
                if( [ 'extend', 'OriginalConstructor' ].indexOf( property ) !== -1 ) continue;
                if( property !== 'name') Dest[ property ] = Source[ property ];
              }
            }
          }
        };


        // This method will be attached to `list` in `declare()`,
        // and it will be used to make sure that only fresh prototypes
        // are added
        var constructorAlreadyInList = function( Ctor, list ){

          var CtorConstructor = Ctor.OriginalConstructor ||  Ctor;
          var protoConstructor;

          var found = false;
          for( var i = 0, l = list.length; i < l; i ++ ){
            var proto = list[ i ];

            protoConstructor = proto.constructor.OriginalConstructor || proto.constructor;
            if( protoConstructor === CtorConstructor ){
              found = true;
              break;
            }
          }

          return found;    
        };

        // Normalise arguments passed to declare(): the end result will always be
        // an object with two values:
        //  * SuperCtorList - an array of constructors
        //  * protoMixin - an object with prototype attributes
        // This implies that you can actually throw basically anything that makes sense
        // to declare: declare(), declare( A ), declare( )
        var workoutDeclareArguments = function( args ){

          var arg;

          // No arguments at all: inheriting straight from Object, nothing in the prototype
          if( args.length === 0 ) return { SuperCtorList: [], protoMixin: {} };

          // One argument: it could be:
          //   * An array of constructors
          //   * A protoMixin
          //   * A single constructor
          //  Act accordingly
          if( args.length === 1 ){

            arg = args[ 0 ];
            // It's an array of constructors
            if( Array.isArray( arg ) )
              return { SuperCtorList: arg, protoMixin: {} };
            // It's a protoMixin
            else if( typeof arg === 'object' && arg !== null )
              return { SuperCtorList: [], protoMixin: arg };
            // It's a constructor
            else if( typeof arg === 'function' )
              return { SuperCtorList: [ arg ], protoMixin: {} }; 
            else 
              throw new Error( "Invalid lone argument to declare(), needs to be array, function or pure object" );
          }

          // Two arguments. Only check if the first one is an array. If it is, then it's the list of
          // constructors, with second argument POSSIBLY being protoMixin
          if( args.length === 2 ){
            var a = args[ 0 ];
            var b = args[ 1 ];

            // First parameter is an array: that's the list of ctors
            if( Array.isArray( a ) ){
              // Normalise b
              if( typeof b !== 'object' || b === null ) b = {};
              return { SuperCtorList: a, protoMixin: b };
            }
          }

          // CHECK POINT: at this point, there are 2 or more arguments, and the "array as first proto" is
          // out of the picture. So, will go through args and make up the array based on it
          var lastIndex = args.length - 1;
          var list = [];
          // This cycle will deal with all items except the last one, which might be either a
          // constructor or a protoMixin
          for( var i = 0; i < lastIndex; i ++ ){
            var item = args[ i ];

            // Check that it's the right type, allowing for the last one to be an exception
            if( typeof item !== 'function' )
              //console.err( "ITEM: ", item );
              throw new Error("Parameters to declare() must be constructor functions (except the last one which can be an object for the prototype)");
            list.push( item );
          }

          // The last one might be either a constructor function, or a protoMixin.
          // Deal with either case
          var lastOne = args[ lastIndex ];
          if( typeof lastOne === 'function' ){
            list.push( lastOne );     
            return { SuperCtorList: list, protoMixin: {} };
          } else if( typeof lastOne === 'object' && lastOne !== null ) {
            return { SuperCtorList: list, protoMixin: lastOne };
          } else throw new Error("Last argument of declare() must be either a function or a mixin object");
        };

        // Parameters are very variable
        var declare = function(){

          // These will be worked out from `arguments`
          var SuperCtorList, protoMixin;

          var MixedClass, ResultClass;
          var list = [];
          var i, l, ii, ll;
          var proto;


          var r = workoutDeclareArguments( arguments );
          SuperCtorList = r.SuperCtorList;
          protoMixin = r.protoMixin;

          // No parameters: inheriting from Object directly, no multiple inheritance
          if( SuperCtorList.length === 0 ){
            MixedClass = Object;
          }
          // Only one parameter: straght single inheritance.
          else if( SuperCtorList.length === 1 ){
            MixedClass = SuperCtorList[ 0 ];

          // More than one parameter: multiple inheritance at work
          // MixedClass will end up being an artificially made constructor
          // where the prototype chain is the sum of _every_ prototype in
          // every element of SuperCtorList (taking out duplicates)
          } else {
            MixedClass = Object;

            // NOW:
            // Go through every __proto__ of every derivative class, and augment
            // MixedClass by inheriting from A COPY OF each one of them.

            list = [];
            for( i = 0, l = SuperCtorList.length; i < l; i ++ ){
          
              // Get the prototype list, in the right order
              // (the reversed discovery order)
              // The result will be placed in `subList`
              var subList = [];    
              proto = SuperCtorList[ i ].prototype;
              while( proto ){
                if( proto.constructor !== Object ) subList.push( proto );
                proto = Object.getPrototypeOf( proto );
              }
              subList = subList.reverse();

              // Add each element of sublist as long as it's not already in the main `list`
              for( ii = 0, ll = subList.length; ii < ll; ii ++ ){
                if( ! constructorAlreadyInList( subList[ ii ].constructor, list ) ) list.push( subList[ ii ] );
              }
            }

            // For each element in the prototype list that isn't Object(),
            // augment MixedClass with a copy of the new prototype
            for( ii = 0, ll = list.length; ii < ll; ii ++ ){
              proto = list[ ii ];

              var M = MixedClass;

              if( proto.constructor !== Object ){

                MixedClass = makeConstructor( MixedClass, proto, proto.constructor );    
                copyClassMethods( M, MixedClass ); // Methods previously inherited

                copyClassMethods( proto.constructor, MixedClass ); // Extra methods from the father constructor
              }
            }
          }

          // Finally, inherit from the MixedClass, and add
          // class methods over
          // MixedClass might be:
          // * Object (coming from no inheritance),
          // * SuperCtorList[0] (coming from single inheritance)
          // * A constructor with the appropriate prototype chain (multiple inheritance)
          ResultClass = makeConstructor( MixedClass, protoMixin );
          copyClassMethods( MixedClass, ResultClass );
         
          // Add getInherited, inherited() and inheritedAsync() to the prototype
          // (only if they are not already there)
          if( ! ResultClass.prototype.getInherited ) {
            ResultClass.prototype.getInherited = getInherited;
          }
          if( ! ResultClass.prototype.inherited ) {
            ResultClass.prototype.inherited = makeInheritedFunction( 'sync' );
          }
          if( ! ResultClass.prototype.inheritedAsync ) {  
            ResultClass.prototype.inheritedAsync = makeInheritedFunction( 'async' );
          }

          // Add instanceOf
          if( ! ResultClass.prototype.instanceOf ) {    
            ResultClass.prototype.instanceOf = instanceOf;
          }

          // Add class-wide method `extend`
          ResultClass.extend = function(){
            return extend.apply( this, arguments );
          };

          // That's it!
          return ResultClass;
        };

        // Returned extra: declarableObject
        declare.extendableObject = declare( Object );

        exports = module.exports = declare;
      
      });
    }(
        typeof define == 'function' && define.amd ?
            define :
            function ( factory ) { factory( require, exports, module); }
    ));