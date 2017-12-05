

# The basics

hotCoreComet exports two important variables:

* `stores`. The stores it defines
* `connections`. The list of clients connected. Each connection object is indexed by
   its tabId, and it contains the user's session (which will likely have
  `loggedIn` and `userId` set)

The whole design is based on "comet events", which are object like:

    var cometEvent = {
        stores: stores,
        connections: connections,
        message: message,
        sessionData: sessionData,
        tabs: tabs,
        fromClient: false,
        fromTabId: fromTabId
    };

They are meant to be self-contained, and provide full info.
Here:

* `stores` and `connections` are stores and connections as exported by hotCoreComet
* `message` is the message emitted. The only **required** property in message is `type`
* `sessionData` is the data from the user's session that is originating the request.
   It's what comes from `req.session`. It's important for the emitter to have access to it
* `tabs` is the result if db.tabs.dbLayer.select({}).
* `fromClient` is `true` for messages that were originated from the clients
* `fromTabId` is the tabId that generated the message

One of the following events will be emitted by default by hotCoreComet:
(note: in each case, `emitAndSendMessages` will always be called)

## `store-change`

The 'store-change' can come from a store operation or a DB operation.

For stores, it's emitted by stores enhanced by the `HotCometEventsMixin` mixin which will
take `fromTabId` out of request.body and set `request.data.fromTabId`

For db operations, it's Emitted when dbLayer tables are modified.
In this case, there is no mixin: the `HotCoreComet` module will go through
each store and add an event listener to every db backend for each store.
Note that the cometEvent object will only have `sessionData` and (potentially)
`fromTabId` if it was called with the `request` object in its options.
JsonRestStores does this by default.

In any case, the message is:

    var message = {
      type: 'store-change',
      record: record,
      idProperty: idProperty,
      op: 'put' || 'delete' || 'post',
      storeName: storeName,
      fromStore: true,
      existing||new: true
      fromDb ||fromStore: true
    };



## `user-online-changed`
Emitted when a user comes online or offline, with properties `userId` (the userId) and
`online` (which will be `true` or `false` depending on what happened)

## `whatever-you-like`
Clients are able to emit messages which all trigger the emission of them as comet messages.
These messages have the `fromClient` flag set to true.

### Kidnapped messages

Some messages aren't relayed. They are:

* `ping`. Clients will send a ping every 20 seconds to confirm they are alive
* `subscribe`, `unsubscribe`. Clients can "subscribe" to certain things. hotCoreComet
   simply keeps a list of subscriptions. It's up to the modules to do smething with them

# Triggering messages to clients

Emitting a comet event is not enough. In all cases, the call `emitAndSendMessages(cometEvent)`
which does some magic:

*  
