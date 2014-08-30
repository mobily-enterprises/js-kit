# How store messages work


## hotCoreJsonRestStores.js


Comet events (events that will be passed on to all other connected tabs) are triggered by emitting `cometBroadcast`:

    hotplate.hotEvents.emit('cometBroadcast', userId, tabId, makeTabIdHash, message, cb );

hotCoreJsonRestStores.js provides a mixin that overloads afterXXXX() calls in JsonRestStores, like so:

    afterPutExisting: function afterPutExisting( request, doc, fullDoc, docAfter, fullDocAfter, overwrite, done){
      var self = this;

      this.inheritedAsync( afterPutExisting, arguments, function( err ){
        if( err ) return done( err );

        self._broadcast( request, 'storeRecordUpdate', docAfter[ self.idProperty], docAfter, done );
      });
    },    

So, _broadcast is called. It's a simple call:

    this.broadcastStoreChanges( request, type, objectId, object, options, cb );

`this.broadcastStoreChanges()` is a public API call that will broadcast a comet message about the store having changed. Its final goal is to emit a `cometBroadcast` event:

    hotplate.hotEvents.emit('cometBroadcast', userId, tabId, makeTabIdHash, message, cb );

`userId, `tabId` and `beforeId` are either taken from `options`, or worked out from `request` (which is why it's passed). Note that while `userId` and `tabId` are passed as "main" cometBroadcast parameters, `beforeId` is added to the message itself.

The basic message is just this:

    // Make up basic message variable
    message = { type: type, storeName: this.storeName, targetId: objectId, target: object };

However, _all_ parameter passed to `options` are added to the message itself. 

So, every time there is a modification to a store, a `cometBroadcast` message is triggered.

The message types that broadcastStoreChanges can emit are `storeRecordUpdate`, `storeRecordCreate' `storeRecordRemove`.

## hotCoreComet.js

hotCoreComet listens to cometBroadcast events:

    hotplate.hotEvents.on('cometBroadcast', 'hotCoreComet', function( userId, tabId, makeTabIdHash, message, done ){

When an event happens, it simply adds it to the queue of all listening tabs (except the one that originated it -- that's why tabId is passed).
tabId is no longer necessary after this process: a message in the database has tis schema:

    schema: new BasicSchema({
      fromUserId:    { type: 'id', required: false },
      message:       { type: 'serialize', required: true },
      added:         { type: 'date', default: function() { return new Date() } },
    }),

## hotDojoComet/messages.js

messages.js will fetch comet messages from the server; whenever there is a message, it will emit it:

    topic.publish( item.message.type, item.fromUserId, item.message, true );

(The last `true` is the `remote` parameter: set to true, means that the message comes from the server).
So, the Dojo application ends up with a topic published, where the `message.type` is the topic's name.
Topic names that start with `reset` are special: they are expected to carry a tabId, which will represent the the tabId assigned from the server.
`reset` messages might also carry more information.

## hotDojoStores/AppStoreNotify.js

To monitor changes from the outside, AppStoreNotify.js will listen to the topics emitted by hotDojoComet/messages:

    topic.subscribe('storeRecordUpdate', function( from, message, remote ){
    topic.subscribe('storeRecordCreate', function( from, message, remote ){
    topic.subscribe('storeRecordRemove', function( from, message, remote ){

These functions will cycle through the store instances matching the names (using the `store()` function), and then calling the `put()`:

    topic.subscribe('storeRecordUpdate', function( from, message, remote ){

      // It will only deal with remote events, local ones are totally ignored
      if( ! remote ) return;

      var definedStores = stores( message.storeName );
      for( var k in definedStores ){
        var store = definedStores[ k ];

        if( objectValuesIn( store.target, store.targetHash, message.target ) ){

          // Place the item in the right spot in the cache
          // Note that `message` is passed as the `put()`'s parameters option
          // since it will contain objectId
          if( store.memCache) store.memCache.put( message.target, message );

          // Emit the update event, which will effectively notify all tracking widgets
          store.emit( 'update', message );

        }
      }
    });

Note that `message` is passed a parameter. This ensures that `beforeId` for example is passed. However, anything else is also passed -- which means that it's possible to emit custom messages from the server for custom stores.

Note that the code for storeRecordRemove is a little different:

    // Make up removeParameters. Since I need an extra attribute, `id`, I make a new
    // object so that I don't modify the message object (which would be probably fine,
    // but dirty and side-effect-ish)
    var removeParameters = {};
    for( var k in message ) removeParameters[ k ] = message[ k ];
    removeParameters.id = message.targetId;

    // Delete the element from the cache
    if( store.memCache) store.memCache.remove( message.targetId, removeParameters );

    // Emit the update event, which will effectively notify all tracking widgets
    store.emit( 'remove', removeParameters );

That's because the message is still passed as a parameter, but `store.remove()` wants the `id` parameter set.

There is another side to appStoreNotify: the mechanism of having messages coming from the server is mirrored client-side, with this code:

    topic.subscribe( 'hotplate/hotDojoStores/newStore', function( storeName, store ){

      store.on( 'add,update,remove', function( event ){

        var topicType, topicEvent = {};

        // Publish the topic depending on the event. This is to make sure that the application
        // can listen to storeRecord????? events, and get both the local ones and the remote ones
        // treating them the same way. This is especially useful if a developer wants to monitor
        // changes to a store _globally_, without running `on()` for specific instances
        var topicType = event.type === 'add' ? 'storeRecordCreate' : (  event.type === 'update' ? 'storeRecordUpdate' : 'storeRecordRemove' );
       
        // Creating the basic topic event
        topicEvent = { storeName: storeName, target: event.target, targetId: event.target[ store.idParam ], beforeId: event.beforeId };

        topic.publish( topicType, globals.userId, topicEvent, false )

      });
    });

This means that the application can _always_ expect `storeRecordUpdate`, `storeRecordCreate' `storeRecordRemove` to be emitted, whether the change happened locally, or remotely. This is convenient when developers want to monitor changes to a store, without tapping into each instance's events.

### The alsoNotify parameter

Stores can have an `alsoNotify` parameter, which is an array of store names. If set appStoreNotify.js will make sure that, when a store changes, the alsoNotify stores are also notifed of the change. Here is the code:

    // Make sure that events are broadcast to alsoNotify stores and that alsoNotify store's
    // cache is updated accordingly

    topic.subscribe( 'hotplate/hotDojoStores/newStore', function( storeName, store ){

      store.on( 'add,update,remove', function( event ){

        if( event.withinAlsoStoreNotification ) return;

        // Check if store.alsoNotify has elements -- if it does, they are "sibling" stores
        if( store.alsoNotify ){

          // Make up the new, enriched, event
          var newEvent = lang.mixin( event );
          newEvent.withinAlsoStoreNotification = true;

          // For each entry in alsoNotify, get the list of store instances (each one
          // might have a different target)
          for( var i = 0, l = store.alsoNotify.length; i < l; i ++){
            var alsoStores = stores( store.alsoNotify[ i ] );

            if( alsoStores ){

              // Go through each store instance
              for( var k in alsoStores ){
                var alsoStore = alsoStores[ k ];

                // If the paramIds matches, then add the item to the alsoStore cache
                // and issue a notify for the alsoStore for the object
                if( objectValuesIn( alsoStore.target, alsoStore.targetHash, event.target ) ){
                  if( event.type == 'add' || event.type == 'update' ){

                    var options = {};
                    if( event.beforeId ) beforeId = event.beforeId;

                    alsoStore.memCache.put( event.target, options );
                    alsoStore.emit( newEvent );
                
                  } else {
                    alsoStore.memCache.remove( event.target );
                    alsoStore.emit( newEvent );
                  }
                }
              }
            }
          }
        }
      });
    });

By reading the code, it's clear that this is a simple way to keep related stores in sync. This is useful when, for example, there are two remote stores with different names, but that will manipulate the same data on the server.
Think about `workspacesUsers` and `usersWorkspaces`: they are two different stores linked to the same database table. So, when one changes, the other one should also change.

