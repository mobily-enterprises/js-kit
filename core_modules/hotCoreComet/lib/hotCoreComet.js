"use strict";


/*

* the client has no idea of tabIds in messages. All the client knows is that it has a tabid, and that
  it will try and include it in forms.

*/

var dummy
  , hotplate = require('hotplate')

  , declare = require('simpledeclare')

  , async = require( 'async' )
  , SimpleDbLayer = require( 'simpledblayer' )
  , SimpleSchema = require( 'simpleschema' )
  , JsonRestStores = require( 'jsonreststores' )
  , hotCoreStore = require( 'hotplate/core_modules/hotCoreStore' )

  , hotCoreStoreConfig = require( 'hotplate/core_modules/hotCoreStoreConfig' )
  , hotCoreStore = require( 'hotplate/core_modules/hotCoreStore' )
  , debug = require('debug')('hotplate:hotCoreComet')
  , WebSocketServer = require('ws').Server
  , crypto = require('crypto')
  , hotCoreServerLogger = require( 'hotplate/core_modules/hotCoreServerLogger' )
  , logger = hotCoreServerLogger
;

var consolelog = debug;



hotplate.config.set('hotCoreComet', {
  makeSessionData: function( req, cb  ){ return cb( null, {} ); },
  makeDefaultSubscriptions: function( req, tabId, sessionData, cb  ){ return cb( null, [] ); }
});


var IDLETABLIFESPAN = 1000 * 60 * 5;
var CLEANUPINTERVAL = 1000 * 30;

// TESTS
//var IDLETABLIFESPAN = 1000 * 20;
//var CLEANUPINTERVAL = 1000 * 5;


var intervalHandles = [];
// On shutdown, stop all intervals
process.on( 'hotplateShutdown', function(){
  intervalHandles.forEach( function( i ){
    clearInterval( i );
  });
});


exports.HotCometEventsMixin  = declare( Object,{

  prepareBody: function f( request, method, body, cb ){
    if( body.fromTabId ){
      consolelog("fromTabId found in body, getting it out and enrighing request.data")
      request.data.fromTabId = body.fromTabId;
      delete body.fromTabId;
      consolelog("Request.data now:", request.data );
    }
    this.inheritedAsync( f, arguments, function( err, preparedBody ){
      if( err ) return cb( err );

      cb( null, preparedBody );

    } );
  },

  afterEverything: function f( request, method, cb ){

    var storeName = this.storeName;
    var self = this;

    this.inheritedAsync( f, arguments, function( err, res ){
      if( err ) return cb( err );

      consolelog("SPROUT: STORE METHOD afterEverything, method ", method, "WILL POSSIBLY GENERATE A COMET EVENT."  );

      consolelog("Checking emitCometStoreEvents...", self.emitCometStoreEvents );
      // If emitStoreCometEvents is not on, don't do anything
      if( ! self.emitCometStoreEvents ){
        consolelog("This store is comet enabled but it doesn't have emitCometStoreEvents set, nothing to do")
        return cb( null );
      }

      // Do not deal with get-like queries
      if( method == 'getQuery' || method == 'get') return cb( null );

      stores.tabs.dbLayer.select( { }, function( err, tabs ){
        if( err ) return; // TODO LOG

        var record = request.data.preparedDoc;

        var message = {
          type: 'store-change',
          record: record,
          op: method,
          storeName: storeName,
        };
        if( method == 'put'){
          if( request.putExisting ) message.existing = true;
          if( request.putNew ) message.new = true;
        }


        var cometEvent = {
          message: message,
          sessionData: request.session,
          stores: stores,
          connections: connections,
          tabs: tabs,
          fromTabId: request.data.fromTabId,
          fromClient: false
        };

        consolelog("Store is comet-emabled. Will emit the following comet-event:" );
        var ce = cometEvent;
        consolelog("Comet event: ", { message: ce.message, sessionData: ce.sessionData, connections: ce.connections, tabs: ce.tabs } );


        emitAndSendMessages( cometEvent, function( err ){
          if( err ) consolelog("Error runnign emitAndSendMessages:", err );

          cb( null );
        });
      });
    });
  }
});


// This is important for stores that have afterEverything change the returned data, and
// want to make sure that the mixin's afterEverything is run last
exports.enableCometEvents = function( Store ){
  return declare( [ Store, exports.HotCometEventsMixin ] );
}

var currentlyDeliveringTab = {};
var stores = {};

//logger.log( { error: err, system: true, logLevel: 3, message: "Error while adding message to the queue table" } );


var sendMessage = exports.sendMessage = function( tabId, message, cb ){

  consolelog("Adding message to the tabMessages table:", message, "for tabid:", tabId );
  stores.tabMessages.dbLayer.insert( { message: message, tabId: tabId }, function( err, messageRecord ){
    if( err ) return cb( err );

    consolelog("Message added to list, triggering sendMessagesInTab() so that it's sent out immediately.");

    sendMessagesInTab( tabId, function(){} );
    return cb( null );
  });
};


function emitAndSendMessages( cometEvent, cb ){

  consolelog("EMITTING comet-event, and then sending messages to the stores depending on what comes back");

  hotplate.hotEvents.emitCollect( 'comet-event', cometEvent, function( err, entriesToSend ){
    if( err ) return cb( err );

    entriesToSend = entriesToSend.onlyResults().reduce(function( a, b ){  return a.concat( b ); }, [] );

    consolelog( 'Total list of messages to send:', entriesToSend );

    async.eachSeries(
      entriesToSend,

      function( entry, cb ){
        consolelog("Sending message:", entry, "to tabId", entry.to );
        sendMessage( entry.to, entry.message, cb );
      },

      function( err ){
        if( err ) return cb( err );

        consolelog("All messages added to the queue!" );

        cb( null );
      }
    )

  });
};


function makeSubscriptionHash( r ){
  consolelog("Making hash for subscription:", r );
  var s = r.tabId + r.handle + r.p1 + r.p2 + r.p3 + r.p4;
  consolelog("String to hash:", s );
  return crypto.createHash("sha256").update(s).digest("base64");
}

function sendMessagesInTab( tabId, cb ){

  consolelog("Entered sendMessagesInTab for tab:", tabId);

  // Semaphore. Only one instance of this is to run at any given time
  if( currentlyDeliveringTab[ tabId ] ){
    consolelog("Already running for tab ", tabId);
    return cb( null );
  }
  currentlyDeliveringTab[ tabId ] = true;

  consolelog("Looking up tab", tabId);
  stores.tabs.dbLayer.selectById( tabId, function( err, tab ){
    if( err ){
      delete currentlyDeliveringTab[ tabId ];
      return cb( err );
    }
    if( ! tab ){
      delete currentlyDeliveringTab[ tabId ];
      logger.log( { system: true, logLevel: 3, message: "sendMessagesInTab was called, but the tab wasn't found", data: { tabId: tabId } }  );
      return cb( null );
    }


    consolelog("Fetching messages for the tab...", tabId);
    stores.tabMessages.dbLayer.selectByHash( { tabId: tabId }, function( err, tabMessages ){
      if( err ){
        delete currentlyDeliveringTab[ tabId ];
        return cb( err );
      }

      if( !tabMessages.length ){
        consolelog("No messages to be delivered.", tabId);
        delete currentlyDeliveringTab[ tabId ];
        return cb( null );
      }


      consolelog("There are messages to be delivered:", tabId, tabMessages.length );
      async.eachSeries(

        tabMessages,

        function( record, cb ){

          consolelog("Checking the connection...", tabId);

          // If the connection is not there, all good but "false" (delivery failed)
          var ws = connections[ record.tabId ] && connections[ record.tabId ].ws;
          if( ! ws ) return cb( new Error("No websocket connection") ); // End of cycle will kill currentlyDeliveringTab

          var message = record.message;
          message.messageId = record.id;

          // Attempt delivery over websocket. If it works, great. If it doesn't,
          // sorry.
          consolelog("Attempt to stringify the message", tabId);
          try {
            var strMessage = JSON.stringify( message );
          } catch ( err ){
            return cb( err );
          }

          consolelog("Sending message through the websocket", tabId);
          ws.send( strMessage, function( err ){
            if( err ) return cb( err ); // End of cycle will kill currentlyDeliveringTab

            consolelog("Deleting the message", tabId);

            stores.tabMessages.dbLayer.deleteById( record.id, function( err ){
              if( err ) return cb( err ); // End of cycle will kill currentlyDeliveringTab

              consolelog("Updating lastSync", tabId);

              cb( null );
            });
          })
        },

        function( err ){
          if( err ){
            consolelog("ERROR!", err );
            delete currentlyDeliveringTab[ tabId ];
            return cb( err );
          }

          consolelog("All messages have been sent successfully!");
          consolelog("Now running sendMessagesInTab again in case messages were added WHILE sending these");
          delete currentlyDeliveringTab[ tabId ];

          // Rerun sendMessagesInTab to check that messages weren't added while going
          // through this loop
          sendMessagesInTab( tabId, cb );
        }
      );

    });
  });
}


intervalHandles.push( setInterval( function(){

  consolelog("*****************************Cleaning up unused tabs, where date is less than: %s", new Date( new Date() - IDLETABLIFESPAN ) );

  //debug( "Cleaning up expired tabs and tab messages..." );

  stores.tabs.dbLayer.select( { type: 'lte', args: [ 'lastSync', new Date( new Date() - IDLETABLIFESPAN ) ] }, { multi: true }, function( err, oldTabs ){
    if( err ){
      logger.log( { error: err, system: true, logLevel: 3, message: "Error while getting tabs" } );
      return;
    }

    consolelog( 'Tabs to kill:', oldTabs.map( ( item ) => { return item.id } ) );

    oldTabs.forEach( function( tab ) {
      consolelog( 'Calling killTab for ', tab.id );

      killTab( tab.id );
    })
  });

}, CLEANUPINTERVAL ) );


/*
// Backup plan in case one of the tabs gets stuck
intervalHandles.push( setInterval( function(){
  consolelog("This is a backup plan procedure");

  stores.tabs.dbLayer.select( {}, function( err, tabs ){
    if( err ) return;

    tabs.forEach( (tab) => {
      consolelog("Manually running sentMessageInTab for:", tab.id)
      sendMessagesInTab( tab.id, function(){} );
    });
  });

}, 5000 ) );
*/


function killTab( tabId ){
  consolelog( 'Actually killing tab:', tabId );


  consolelog( 'Checking if the connection is still up for tab', tabId );
  var ws = connections[ tabId ] && connections[ tabId ].ws;
  if( ws ){
    consolelog( 'Connection is still up. Killing connection/deleting for tab', tabId );
    ws.close();
    delete connections[ tabId ].ws
  }

  stores.tabSubscriptions.dbLayer.deleteByHash( { tabId: tabId }, function( err ){
    if( err ) logger.log( { error: err, system: true, logLevel: 3, message: "Error while killing tabSubscriptions", data: { tabId: tabId }  } );

    stores.tabMessages.dbLayer.deleteByHash( { tabId: tabId }, function( err ){
      if( err ) logger.log( { error: err, system: true, logLevel: 3, message: "Error while killing tabMessages", data: { tabId: tabId }  } );

      stores.tabs.dbLayer.deleteById( tabId, function( err ){
        if( err ) logger.log( { error: err, system: true, logLevel: 3, message: "Error while killing tab", data: { tabId: tabId }  } );
      });
    });
  });

}

var connections = exports.connections = {};

function ensureTab( tabId, ws, sessionData, cb ){

  consolelog("Ensuring that tabId is there:", tabId)
  stores.tabs.dbLayer.selectById( tabId, function( err, record ){
    if( err ) return cb( err );

    if( record ){
      consolelog("tabId already there, nothing to add");
      return cb( null, false );
    }

    consolelog("Before adding tabId to the db, adding the Subscriptions...");
    var makeDefaultSubscriptions = hotplate.config.get('hotCoreComet.makeDefaultSubscriptions');
    makeDefaultSubscriptions( ws.upgradeReq, tabId, sessionData, function( err, defaultSubscriptions ){
      if( err ) return cb( err );

      consolelog("Default subscriptions:", defaultSubscriptions );

      async.eachSeries(
        defaultSubscriptions,

        function( subscription, cb ){
          consolelog("Adding subscription: ", subscription);

          subscription.tabId = tabId;
          subscription.hash = makeSubscriptionHash( subscription );
          stores.tabSubscriptions.dbLayer.insert( subscription, function( err, record ){
            if( err ) return cb( err );

            return cb( null );
          });
        },

        function( err ){
          if( err ){
            consolelog("There was an error trying to add subscriptions. Deleting the ones already added, and quitting");
            stores.tabSubscriptions.dbLayer.deleteByHash( { tabId: tabId }, function( err, record ){
              if( err ) consolelog("Error deleting pending after error creating subscriptions", tabId, err)
            });
            return cb( err );
          }

          consolelog("Adding tabId to the db...");
          stores.tabs.dbLayer.insert( { id: tabId }, function( err, record ){
            if( err ){
              consolelog("There was an error trying to add the tab. Deleting the ones already added, and quitting");
              stores.tabSubscriptions.dbLayer.deleteByHash( { tabId: tabId }, function( err, record ){
                if( err ) consolelog("Error deleting pending after error creating tab", tabId, err );
              });
              return cb( err );
            }

            cb( null, true );
          });
        }
      );
    });
  });
}

hotplate.hotEvents.onCollect( 'serverCreated', 'hotCoreComet', hotplate.cacheable( function( server, done ){

  consolelog("Creating websocket server...");

  var wss = new WebSocketServer({ server: server, path: '/ws', perMessageDeflate: false })

  wss.on('connection', function connection( ws ) {

    var location = require('url').parse(ws.upgradeReq.url, true);
    var tabId = location.query.tabId;
    consolelog("Connected! tabId:", tabId );


    var makeSessionData = hotplate.config.get('hotCoreComet.makeSessionData');
    makeSessionData( ws.upgradeReq, function( err, sessionData ){
      if( err ){
        logger.log( { error: err, system: true, logLevel: 3, message: "Error while creating session data" } );
        ws.close();
        return;
      }
      consolelog("CONNECTION DATA:", sessionData );

      ensureTab( tabId, ws, sessionData, function( err, tabIsNew ){
        if( err ){
          logger.log( { error: err, system: true, logLevel: 3, message: "Error while running ensureTab" } );
          ws.close();
          return;
        }
        sessionData.ws = ws;
        connections[ tabId ] = sessionData;

        consolelog("CONNECTIONS:", require('util').inspect( connections, { depth: 1 } ) );

        // If tab is new, send a reset message
        if( tabIsNew ){
          consolelog("It's a new tab! Starting with a fresh 'reset' message")
          sendMessage( tabId, { type: 'reset' }, function( err ){
            if( err ){
              logger.log( { error: err, system: true, logLevel: 3, message: "Error while sending 'reset' message to tab" } );
            }
          } );
        } else {
          consolelog("It's an existing tab! Since client is reconnecting, checking that queue is empty")
          sendMessagesInTab( tabId, function( err ){
            if( err ){
              logger.log( { error: err, system: true, logLevel: 3, message: "Error while sending messages in tab", data: { tabId: tabId } } );
            }
          } );
        }


        /*
        setInterval( function(){
          sendMessage( tabId, { type: 'reset' }, function( err ){} );
        },10000 );
        */

        ws.on('close', function connection(ws) {
          consolelog("Connection from tab closed:", tabId );

          // Do not delete connections[ tabId ] as it's still needed to get session information
          // even if the connection is down

          // Do NOT delete the entry from tabs -- it could be a temporary
          // disconnection!

          // *************************************
          // This function ends here
          // ************************************
        });


        ws.on('message', function incoming( message ) {
          consolelog("\n\n\n");
          consolelog('Received message from a socket:', message );

          try {
            message = JSON.parse( message );
          } catch( e ){
            logger.log( { system: false, logLevel: 2, message: "Could not parse message", data: { message: message }  } );
            return;
          }

          // Update lastSync since a message was received
          consolelog('Updating lastSync for that tab', tabId );
          stores.tabs.dbLayer.updateById( tabId, { lastSync: new Date() }, function( err ){
            if( err ){
              logger.log( { error: err, system: true, logLevel: 3, message: "Could not parse message", data: { message: message }  } );
            }
          });


          // Just making sure a user is not forging it, never trust anything from the client
          message.tabId = tabId;

          console.log("Message type:", message.type );
          switch( message.type ){

            case 'ping':
              consolelog("Not propagating it since it's only a ping message. However, triggering check for messages in queue");
              sendMessagesInTab( message.tabId, function( err ){
                if( err ){
                  logger.log( { error: err, system: true, logLevel: 3, message: "Error while sending messages in tab", data: { tabId: tabId } } );
                }
              });
            break;

            case 'unsubscribe':
              consolelog("Adding subscription");

              var sub = {
                tabId: message.tabId,
                handle: message.handle,
              }
              if( typeof message.p1 !== 'undefined' ) sub.p1 = message.p1;
              if( typeof message.p2 !== 'undefined' ) sub.p2 = message.p2;
              if( typeof message.p3 !== 'undefined' ) sub.p3 = message.p3;
              if( typeof message.p4 !== 'undefined' ) sub.p4 = message.p4;
              sub.hash = makeSubscriptionHash( sub );

              stores.tabSubscriptions.dbLayer.deleteByHash( sub, function( err, total ){
                if( err ){
                  logger.log( { error: err, system: true, logLevel: 3, message: "Could not unsubscribe", data: { sub: sub } } );
                  return;
                }
              });

            break;

            case 'subscribe':
              consolelog("Adding subscription");

              var sub = {
                tabId: message.tabId,
                handle: message.handle,
              }
              if( typeof message.p1 !== 'undefined' ) sub.p1 = message.p1;
              if( typeof message.p2 !== 'undefined' ) sub.p2 = message.p2;
              if( typeof message.p3 !== 'undefined' ) sub.p3 = message.p3;
              if( typeof message.p4 !== 'undefined' ) sub.p4 = message.p4;
              sub.hash = makeSubscriptionHash( sub );

              stores.tabSubscriptions.dbLayer.selectByHash( { tabId: tabId }, function( err, total ){
                if( err ){
                  logger.log( { error: err, system: true, logLevel: 3, message: "Could not count subscriptions for tabId", data: { tabId: tabId } } );
                  return;
                }

                if( total > 30 ){
                  consolelog("Too many subscriptions", tabid, total );
                  return;
                }

                stores.tabSubscriptions.dbLayer.selectByHash( { hash: sub.hash }, function( err, dummy, total ){
                  if( err ){
                    logger.log( { error: err, system: true, logLevel: 3, message: "Error finding hash", data: { hash: sub.hash } } );
                    return;
                  }
                  if( total ){
                    consolelog("Handle already registered!", dummy, total);
                    return;
                  }

                  stores.tabSubscriptions.dbLayer.insert( sub, function( err, registerRecord ){
                    if( err ){
                      logger.log( { error: err, system: true, logLevel: 3, message: "Error registering:", data: { sub: sub } } );
                    }

                    // *************************************
                    // This function ends here
                    // ************************************

                  });
                });
              });

            break;

            default:
              consolelog("It's a proper message, propagating it now...");
              // Emit the comet event. This may result in
              stores.tabs.dbLayer.select( { }, function( err, tabs ){
                if( err ){
                  logger.log( { error: err, system: true, logLevel: 3, message: "Error getting tabs before emitting comet message:" } );
                  consolelog("Error getting tabs before emitting comet message", err );
                  return;
                }

                emitAndSendMessages({
                  message: message,
                  sessionData: sessionData,
                  stores: stores,
                  connections: connections,
                  tabs: tabs,
                  fromClient: true,
                }, function( err ){
                  if( err ){
                    logger.log( { error: err, system: true, logLevel: 3, message: "Error running emitAndSendMessages" } );
                  }

                  // *************************************
                  // This function ends here
                  // ************************************

                });
              });
            break;

          }

        });
      });


    });

  });
  done( null );
}));



// Relaying comet-event of type `store-change` to owner tabs
hotplate.hotEvents.onCollect( 'comet-event', function( ce, cb ){

  var consolelog = require('debug')('hotplate:hotCoreComet');
  var message = ce.message;

  consolelog("IN LISTENER TO NOTIFY USERS ABOUT OWN RECORD" );

  // Will only deal with "recordChange"
  if( message.type != 'store-change'){
    console.log("It's not a store-change, ignoring it");
    return cb( null, [] );
  }

  // Will only deal with "recordChange"
  if( message.op != 'put' && message.op != 'post'  ){
    console.log("Only `put` and `post` operations are managed! Ignoring it");
    return cb( null, [] );
  }


  consolelog("Comet event: ", { message: ce.message, sessionData: ce.sessionData, connections: ce.connections, tabs: ce.tabs } );
  consolelog("Record:", message.record );

  // Will only deal with records where userId is there
  var record = message.record;
  if( record && record.userId ) var userId = record.userId;

  // Record doesn't have userId: quit
  if( ! userId ){
    consolelog("Record must have a userId fields, ignoring it");
    return cb( null, [] );
  }

  consolelog("This record is owned by:", userId );

  // Make up shorter variables
  var message = ce.message;
  var sessionData = ce.sessionData;
  var cometStores = ce.stores;
  var connections = ce.connections;
  var tabs = ce.tabs;
  var fromTabId = !! ce.fromTabId;
  var fromClient = !! ce.fromClient;


  consolelog("Going through tabs, looking for ones owned by userId")
  consolelog("Tabs:", tabs );
  var r = [];
  tabs.forEach( ( tab ) =>{

    consolelog("Comparing:", tab.id, ce.fromTabId );
    // Don't echo message back to own tab
    if( tab.id == ce.fromTabId ) {
      consolelog("STOP! tabIds match...");
      return;
    }

    var tabSession = connections[ tab.id ];

    consolelog("Websocket session for the tab (shallow):", require('util').inspect( tabSession, { depth: 0 }  ) );

    if( tabSession && ( tabSession.userId == userId ) ){
      consolelog("Tab is owned by the user! The message WILL BE SENT to this tab!" );
      r.push({
        to: tab.id,
        message: {
          type: 'store-change',
          record: message.record,
          storeName: message.storeName,
          op: message.op,
        }
      })
    } else {
      consolelog("User IDs DO NOT match, nothing to do." );
    }
  });

  consolelog("Returning entries:", r );
  return cb( null, r );
});



hotplate.hotEvents.onCollect('auth', 'main', function (strategyId, action, data, done) {
  consolelog("Auth strategy, acton, data: ", strategyId, action, data );

  if( action != 'signin' && action != 'signout' ) return done( null );

  consolelog("User ", data.userId, " did ", action, ". Checking connections, disconnecting the ones belonging to them");

  Object.keys( connections ).forEach( ( tabId ) => {

    var sessionData = connections[ tabId ];

    if( sessionData && sessionData.userId && sessionData.userId.toString() == data.userId.toString() ){
      consolelog("Found a tab belonging to the user. Disconnecting it.")

      var ws = sessionData.ws;
      if( ws ){
        consolelog( 'Connection is still up. Killing connection/deleting for tab', tabId );
        ws.close();
        delete connections[ tabId ].ws
      } else {
        consolelog( 'Was not connected in the first place...' );
      }
    }
  });
  done( null );
});




hotplate.hotEvents.onCollect( 'stores', 'hotCoreComet', hotplate.cacheable( function( done ){

  // This module only uses JsonRestStores as a way to access the DB and expose methods,
  // it doesn't mixin with hotJsonRestStores (which would do Comet event emission etc.)

  hotCoreStore.get( function( err, s ){
    if( err ) return done( err );

    var BasicDbStore = s.BasicDbStore;
    var BasicSchema = s.BasicSchema;

    var HotStore = s.HotStore;
    var HotSchema = s.HotSchema;

    // ***********************************
    // *** OPEN TABS   *******************
    // ***********************************


    var Tabs = declare( HotStore, {

      schema: new BasicSchema({
        id      : { type: 'string', searchable: true, unique: true },
        lastSync: { type: 'date', searchable: true, default: function(){ return new Date() } },
      }),

      handlePost: true,
      handleDelete: true,

      storeName:  'tabs',
      paramIds: [ 'id' ],

      /*
      nested: [
        {
          type: 'multiple',
          store: 'tabMessages',
          join: { tabId: 'tabId'},
        },
      ]
      */

    });
    stores.tabs = new Tabs();

    // Internal store, only used via API
    var TabMessages = declare( BasicDbStore, {

      schema: new BasicSchema({
        message:       { type: 'serialize', required: true },
        added:         { type: 'date', searchable: true, protected: true, default: function() { return new Date() } },
        tabId:         { type: 'string', searchable: true, required: true }
      }),

      paramIds: [ 'id' ],
      storeName: 'tabMessages',

      autoLookup: {
        tabId: "tabs",
      },

      sortableFields: [ 'added' ],
      defaultSort: { added: 1 },
    });
    stores.tabMessages = new TabMessages();

    // Internal store, only used via API
    var TabSubscriptions = declare( BasicDbStore, {

      schema: new BasicSchema({
        added : { type: 'date', protected: true, searchable: true, default: function() { return new Date() } },
        tabId : { type: 'string', searchable: true, required: true },
        handle: { type: 'string', searchable: true, required: true, trim: 255 },
        p1    : { type: 'string', searchable: true, required: false, trim: 1024 },
        p2    : { type: 'string', searchable: true, required: false, trim: 1024 },
        p3    : { type: 'string', searchable: true, required: false, trim: 1024 },
        p4    : { type: 'string', searchable: true, required: false, trim: 1024 },
        hash  : { type: 'string', searchable: true, required: false, trim: 1024 },
      }),

      paramIds: [ 'id' ],
      storeName: 'tabSubscriptions',

    });
    stores.tabSubscriptions = new TabSubscriptions();

    done( null, stores );
  });

}));


hotplate.hotEvents.onCollect( 'setRoutes', 'hotCoreComet', function( app, done ){

  hotCoreStore.get( function( err, s ){
    if( err ) return done( err );


    Object.keys( s.HotStore.registry ).forEach( ( k ) =>{
      var store = s.HotStore.registry[ k ];


      // TODO: take "|| true" out
      if( ( store.emitCometDbEvents )  && store.dbLayer ){

        [ 'simpledblayer-update-one', 'simpledblayer-delete-one', 'simpledblayer-insert', ].forEach( (op) => {

          consolelog("Adding listener for", store.storeName, "for op:", op );
          store.dbLayer.onCollect( op, function( info, cb ){

            consolelog("SPROUT: DB OP ", op, "WILL GENERATE A COMET EVENT. INFO:", require('util').inspect( info, { dpeth: 1 }  ));

            var request = info.options.request || {};
            var sessionData = request.session || {};

            consolelog("Session data from db's 'request' option:", sessionData );

            stores.tabs.dbLayer.select( { }, function( err, tabs ){
              if( err ) return; // TODO LOG

              var message = {
                type: 'db-change',
                op: {
                  'simpledblayer-update-one': 'update',
                  'simpledblayer-delete-one': 'delete',
                  'simpledblayer-insert': 'insert',
                }[ op ],
                record: info.record,
                storeName: store.storeName,
              };

              // This will only work if the store was enriched with the
              // Comet mixin _and_ the client sent the tabId
              if( request.data && request.data.fromTabId ){
                var fromTabId = request.data.fromTabId;
                consolelog("Store is comet-emabled, it will also have a fromTabId:", fromTabId );
              }

              var cometEvent = {
                message: message,
                sessionData: sessionData,
                stores: stores,
                connections: connections,
                tabs: tabs,
                fromClient: false,
                fromTabId: fromTabId
              };

              var ce = cometEvent;
              consolelog("Comet event: ", { message: ce.message, sessionData: ce.sessionData, connections: ce.connections, tabs: ce.tabs } );

              // The message doesn't have tabId, since... it can't.
              emitAndSendMessages( cometEvent, function( err ){
                if( err ) consolelog("Error runnign emitAndSendMessages:", err );

                cb( null );
              });
            });
          });
        });
      }
    });

    // All listeners are set!
    done( null );
  });
});
