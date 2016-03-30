EventEmitterCollector
=====================

In Nodejs, the [EventEmitter](http://nodejs.org/api/events.html) constructor is great in most situations: it fires up events, and allows others to listen for those events and act appropriately.

There is one use-case that is completely failed by node's EventEmitter: when you want to fire up an event, and you actually want to know _what your listeners have to say about it_. This is imensely useful for example:

* In plugins. You fire up an event called `gather files to send`, and then each function registered with that EventEmitter will add files to the list of the ones to send. Note that 
* In cases where you want to check if an event was handled appropriately. For example, each listener could return `true` of `false` and you could decide what to do in case some of them didn't work (maybe warn the user?)

In these situations, and possibly others I haven't thought of, "welcome to EventEmitterCollector". 

## The API

The EventEmitterCollector constructor can be used just like EventEmitter, adding "Collect" to the methods' signature. Please note that EventEmitter's API is not 100% emulated (although it _can_ be if there is enough interest in this module). At the moment, it supports:

* `onCollect()` (with `addListenerCollect()` as an alias )
* `emitCollect()`

It does _not_ implement:

* `once()`
* `removeListener()`
* `removeAllListeners()`
* `listeners()`
* `setMaxListeners()`

It also adds a specific way to emit events belonging to a specific `module`:

* `emitCollectModule()` 

Event emitter implementation that will actually collect the listener's results and return them

## Usage

Here is the most basic usage of EventEmitterCollector:

    var EventEmitterCollector = require('eventemittercollector');

    var as = new EventEmitterCollector();

    as.onCollect( 'event1', function( done ){
      console.log("Called event 'event1' (first listener)");
      done( null, 'event1, first listener' );
    });

    as.onCollect( 'event1', function( done ){
      console.log("Called event 'event1' (second listener)");
      done( null, 'event1, second listener' );
    });

    as.emitCollect( 'event1', function( err, results ){
      console.log( results );
    });

The result:

    Called event 'event1' (first listener)
    Called event 'event1' (second listener)

    [ { module: 'global', result: 'event1, first listener' },
      { module: 'global', result: 'event1, second listener' } ]

The results are grouped as an array of objects, where the first attribute is `module` (set by default as `global`) and the second one is `result` (which is whatever was returned by the listener).

If any one of the listeners sets the `err` variable, other missing listeners will _not_ be invoked and the callback called by `emit()` will hav ethe error set:

    var EventEmitterCollector = require('eventemittercollector');

    var as = new EventEmitterCollector();

    as.onCollect( 'event1', function( done ){
      console.log("Called event 'event1' (first listener)");
      done( new Error("Did not work") );
    });

    as.onCollect( 'event1', function( done ){
      console.log("Called event 'event1' (second listener)");
      done( null, 'event1, second listener' );
    });

    as.emitCollect( 'event1', function( err, results ){
      console.log( "Error:");
      console.log( err );
    });

The result will be:

    Called event 'event1' (first listener)
    [Error: Did not work]

So, a single listener failing _does_ stop the flow and _does_ mean that something went horribly wrong and should be dealt with.

## Using "modules"

EventEmitterCollector was first developed as a way to write "modules", and allow those modules to emit events identifying themselves as "that particular module".

If you are collecting results from listeners, there are many cases where you want a result to be associated to a specific listener.

So, you can associate a "module" (or, call it an "id") to a listener:

    var EventEmitterCollector = require('eventemittercollector');

    var as = new EventEmitterCollector();

    as.onCollect( 'event1', 'someId', function( done ){
      console.log("Called event 'event1' (first listener)");
      done( null, 'event1, first listener' );
    });

    as.onCollect( 'event1', 'someId', function( done ){
      console.log("Called event 'event1' (second listener)");
      done( null, 'event1, second listener' );
    });

    as.emitCollect( 'event1', function( err, results ){
      console.log( results );
    });

The result is:

    Called event 'event1' (first listener)
    Called event 'event1' (second listener)

    [ { module: 'someId', result: 'event1, first listener' },
      { module: 'someId', result: 'event1, second listener' } ]

You can obviously have a mixture of module names as your listeners:


    var EventEmitterCollector = require('eventemittercollector');

    var as = new EventEmitterCollector();

    as.onCollect( 'event1', 'module1', function( done ){
      console.log("Called event 'event1' (first listener)");
      done( null, 'event1, first listener' );
    });

    as.onCollect( 'event1', 'module2', function( done ){
      console.log("Called event 'event1' (second listener)");
      done( null, 'event1, second listener' );
    });

    as.onCollect( 'event1', function( done ){
      console.log("Called event 'event1' (third listener)");
      done( null, 'event1, third listener' );
    });

    as.emitCollect( 'event1', function( err, results ){
      console.log( results );
    });

The result:

    Called event 'event1' (first listener)
    Called event 'event1' (second listener)
    Called event 'event1' (third listener)

    [ { module: 'module1', result: 'event1, first listener' },
      { module: 'module2', result: 'event1, second listener' },
      { module: 'global', result: 'event1, third listener' } ]

As you can see, the third listener didn't specify a module name. So, it defaulted to "global".

## Parameters to events

You can emit an event and pass it arguments, which will then passed to your listeners. Watch out: the number of arguments _must_ be the same for your emitters and your listeners.

So, for example:

    var EventEmitterCollector = require('eventemittercollector');

    var as = new EventEmitterCollector();

    as.onCollect( 'event1', 'module1', function( n1, n2, done ){
      console.log("Called event 'event1'i (first listener)");
      console.log("n1: " + n1 + "; n2: " + n2 );
      done( null, 'event1, first listener' );
    });

    as.onCollect( 'event1', 'module2', function( n1, n2, done ){
      console.log("Called event 'event1' (second listener)");
      console.log("n1: " + n1 + "; n2: " + n2 );
      done( null, 'event1, second listener' );
    });

    as.onCollect( 'event1', function( n1, n2, done ){
      console.log("Called event 'event1' (third listener)");
      console.log("n1: " + n1 + "; n2: " + n2 );
      done( null, 'event1, third listener' );
    });

    as.emitCollect( 'event1', 10, 20, function( err, results ){
      console.log( results );
    });


The result:

    Called event 'event1' (first listener)
    n1: 10; n2: 20
    Called event 'event1' (second listener)
    n1: 10; n2: 20
    Called event 'event1' (third listener)
    n1: 10; n2: 20
    [ { module: 'module1', result: 'event1, first listener' },
      { module: 'module2', result: 'event1, second listener' },
      { module: 'global', result: 'event1, third listener' },


## Emit only to specific modules

Sometimes, you might want to emit an event but decide to invoke listeners associated to specific modules. In these cases, you would use `emitCollectModule()`:


    var EventEmitterCollector = require('eventemittercollector');

    var as = new EventEmitterCollector();

    as.onCollect( 'event1', 'module1', function( done ){
      console.log("Called event 'event1' (first listener)");
      done( null, { a1: 'event1, first listener' }  );
    });

    as.onCollect( 'event1', 'module2', function( done ){
      console.log("Called event 'event1' (second listener)");
      done( null, { a1: 'event1, second listener' } );
    });

    as.onCollect( 'event1', 'module2', function( done ){
      console.log("Called event 'event1' (third listener)");
      done( null, { a2: 'event1, third listener' } );
    });

    as.onCollect( 'event1', function( done ){
      console.log("Called event 'event1' (fourth listener)");
      done( null, { a2: 'event1, fourth listener' } );
    });

    as.emitCollectModule( 'event1', 'module2', function( err, results ){
      console.log( results );
    });

Result:

    Called event 'event1' (second listener)
    Called event 'event1' (third listener)

    [ { module: 'module2', result: { a1: 'event1, second listener' } },
      { module: 'module2', result: { a2: 'event1, third listener' } },

Only the listeners associated to `module2` were called.


## Helper functions in results

The results array can be boring to manipulate. Sometimes, you just want the results without worrying about what the module name is, for example. The good news is that the `results` array comes with some handy helper functions:

### `onlyResults`

This helper function will strip everything from the array, except the actual results. See:

    var EventEmitterCollector = require('eventemittercollector');

    var as = new EventEmitterCollector();

    as.onCollect( 'event1', 'module1', function( done ){
      console.log("Called event 'event1' (first listener)");
      done( null, 'event1, first listener' );
    });

    as.onCollect( 'event1', 'module2', function( done ){
      console.log("Called event 'event1' (second listener)");
      done( null, 'event1, second listener' );
    });

    as.onCollect( 'event1', 'module2', function( done ){
      console.log("Called event 'event1' (third listener)");
      done( null, 'event1, third listener' );
    });

    as.onCollect( 'event1', function( done ){
      console.log("Called event 'event1' (fourth listener)");
      done( null, 'event1, fourth listener' );
    });

    as.emitCollect( 'event1', function( err, results ){
      console.log( results.onlyResults() );
    });

The result:

    Called event 'event1' (first listener)
    Called event 'event1' (second listener)
    Called event 'event1' (third listener)
    Called event 'event1' (fourth listener)

    [ 'event1, first listener',
      'event1, second listener',
      'event1, third listener',
      'event1, fourth listener' ]

### `groupByModule()`

This helper function will group results by module:

    var EventEmitterCollector = require('eventemittercollector');

    var as = new EventEmitterCollector();

    as.onCollect( 'event1', 'module1', function( done ){
      console.log("Called event 'event1' (first listener)");
      done( null, 'event1, first listener' );
    });

    as.onCollect( 'event1', 'module2', function( done ){
      console.log("Called event 'event1' (second listener)");
      done( null, 'event1, second listener' );
    });

    as.onCollect( 'event1', 'module2', function( done ){
      console.log("Called event 'event1' (third listener)");
      done( null, 'event1, third listener' );
    });

    as.onCollect( 'event1', function( done ){
      console.log("Called event 'event1' (fourth listener)");
      done( null, 'event1, fourth listener' );
    });

    as.emitCollect( 'event1', function( err, results ){
      console.log( results.groupByModule() );
    });


The result:

    Called event 'event1' (first listener)
    Called event 'event1' (second listener)
    Called event 'event1' (third listener)
    Called event 'event1' (fourth listener)

    { module1: [ 'event1, first listener' ],
      module2: [ 'event1, second listener', 'event1, third listener' ],
      global: [ 'event1, fourth listener' ] }

Note that the result is an associative array, with each element being an array of results.


## Afterword

You can argue that this module is not an EventEmitter at all: some argue that events are by definition "fire-and-forget". The API also differs from EventEmitter's, 

I feel that the concepts behind EventEmitterCollectors are very similar to EventEmitter, and that fire-and-forget is only an opinion: wanting to know the results of an event is a fair enough requirement in some cases, even if it's just to know that all listeners actually managed to do what they were meant to do. This is especially true for cases where the success of each listener is critical (let alone the gathering of the results of each listener).



