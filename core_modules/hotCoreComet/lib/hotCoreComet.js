"use strict";

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
;

var consolelog = debug;


hotplate.config.set('hotCoreComet', {
  makeSessionData: function( req, cb  ){ return cb( null, {} ); },
  makeDefaultSubscriptions: function( req, tabId, sessionData, cb  ){ return cb( null, [] ); }
});


var IDLETABLIFESPAN = 1000 * 60 * 5;
var CLEANUPINTERVAL = 1000 * 30;

var intervalHandles = [];
// On shutdown, stop all intervals
process.on( 'hotplateShutdown', function(){
  intervalHandles.forEach( function( i ){
    clearInterval( i );
  });
});


/* ******************************************************** */
/* The basic stores, ready-to-use with the selected DB etc. */
/* ******************************************************** */


exports.HotCometEventsMixin  = declare( Object,{

  afterEverything: function f( request, method, cb ){

    var storeName = this.storeName;

    console.log("AFTEREVERYTHING IN THE STORE HAS THIS BEFORE INHERITEDASYNC:", request.data.preparedDoc)


    this.inheritedAsync( f, arguments, function( err, res ){
      if( err ) return cb( err );


      console.log("AFTEREVERYTHING IN THE STORE HAS THIS RECORD AFTER INHERITEDASYNC:", request.data.preparedDoc)

      // Do not deal with getQuery
      if( method == 'getQuery' || method == 'get') return cb( null );

      stores.tabs.dbLayer.select( { }, function( err, tabs ){
        if( err ) return; // TODO LOG

        var record = request.data.preparedDoc;

        var message = {
          type: 'storeChange',
          record: record,
          op: method,
          storeName: storeName,
        };
        if( method == 'put'){
          if( request.putExisting ) message.existing = true;
          if( request.putNew ) message.new = true;
        }

        console.log("MESSAGE RECORD ABOUT TO SEND FOLLOWING UP:", message );

        // TODO: Try and work out tabId from headers if possible, behaviour will possibly do that
        emitAndSendMessages({
          message: message,
          sessionData: request.session,
          stores: stores,
          connections: connections,
          tabs: tabs,
          fromClient: false
        }, function( err ){
          if( err ) consolelog("Error runnign emitAndSendMessages:", err );

          cb( null );
        });
      });
    });
  }
});


exports.enableCometEvents = function( Store ){
  return declare( [ Store, exports.HotCometEventsMixin ] );
}

var currentlyDeliveringTab = {};
var stores = {};


var sendMessage = exports.sendMessage = function( message, cb ){

  consolelog("Sending message:", message );
  stores.tabMessages.dbLayer.insert( { message: message, tabId: message.tabId }, function( err, messageRecord ){
    if( err ) return cb( err );

    consolelog("Message added to list, triggering sendMessagesInTab()...");

    sendMessagesInTab( message.tabId, function(){} );
    return cb( null );
  });
};


function emitAndSendMessages( cometMessage, cb ){

  console.log("EMITTING comet-message");

  hotplate.hotEvents.emitCollect( 'comet-message', cometMessage, function( err, messagesToSend ){
    if( err ) return cb( err );

    messagesToSend = messagesToSend.onlyResults().reduce(function( a, b ){  return a.concat( b ); }, [] );

    console.log( 'Messages to send:', messagesToSend );

    async.eachSeries(
      messagesToSend,

      function( message, cb ){
        console.log("Sending message:", message );
        sendMessage( message, cb );
      },

      function( err ){
        if( err ) return cb( err );

        cb( null );
      }
    )

  });
};


function makeSubscriptionHash( r ){
  consolelog("Making hash for:", r );
  var s = r.handle + r.p1 + r.p2 + r.p3 + r.p4;
  consolelog("String to hash:", s );
  return crypto.createHash("sha256").update(s).digest("base64");
}

function sendMessagesInTab( tabId, cb ){

  consolelog("Entered sendMessagesInTab for tab", tabId);

  // Semaphore. Only one instance of this is to run at any given time
  if( currentlyDeliveringTab[ tabId ] ){
    consolelog("Already running for tab ", tabId);
    return;
  }
  currentlyDeliveringTab[ tabId ] = true;

  consolelog("Looking up tab...");
  stores.tabs.dbLayer.selectById( tabId, function( err, tab ){
    if( err ){
      delete currentlyDeliveringTab[ tabId ];
      return cb( err );
    }
    if( ! tab ){
      delete currentlyDeliveringTab[ tabId ];
      return new Error("tabId not found!");
    }


    stores.tabMessages.dbLayer.selectByHash( { tabId: tabId }, function( err, tabMessages ){
      if( err ){
        delete currentlyDeliveringTab[ tabId ];
        return cb( err );
      }


      if( !tabMessages.length ){
        consolelog("No messages to be delivered, that's it...");
        delete currentlyDeliveringTab[ tabId ];
        return cb( null );
      }


      consolelog("There are messages to be delivered:", tabId, tabMessages.length );
      async.eachSeries(

        tabMessages,

        function( record, cb ){

          consolelog("Checking the connection...");

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
    consolelog( 'Err and howMany tabs to kill: ', err, oldTabs.length );

    oldTabs.forEach( function( tab ) {
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
  var ws = connections[ tabId ] && connections[ tabId ].ws;
  if( ws ) ws.close();
  if( connections[ tabId ] && connections[ tabId ].ws ) delete connections[ tabId ].ws;
  delete connections[ tabId ];

  stores.tabSubscriptions.dbLayer.deleteByHash( { tabId: tabId }, function( err ){
    stores.tabMessages.dbLayer.deleteByHash( { tabId: tabId }, function( err ){
      stores.tabs.dbLayer.deleteById( tabId, function( err ){
      });
    });
  });

}

var connections = exports.connections = {};

function ensureTab( tabId, ws, sessionData, cb ){

  stores.tabs.dbLayer.selectById( tabId, function( err, record ){
    consolelog("Ensuring that tabId is there:", tabId)
    if( err ){
      consolelog("Error looking up tabId in database", err );
      return;
    }

    if( record ){
      consolelog("tabId already there, nothing to add");
      return cb( null, false );
    } else {
      consolelog("Before adding tabId to the db, adding the Subscriptions...");

      var makeDefaultSubscriptions = hotplate.config.get('hotCoreComet.makeDefaultSubscriptions');
      makeDefaultSubscriptions( ws.upgradeReq, tabId, sessionData, function( err, defaultSubscriptions ){
        if( err ){
          consolelog("Error creating connection data for ", tabId );
          return;
        }

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
    }
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
        consolelog("Error creating connection data for ", tabId );
        ws.close();
        return;
      }
      consolelog("CONNECTION DATA:", sessionData );

      ensureTab( tabId, ws, sessionData, function( err, tabIsNew ){
        if( err ){
          consolelog("Error looking up or creating tab!", err);
          ws.close();
          return;
        }
        sessionData.ws = ws;
        connections[ tabId ] = sessionData;

        consolelog("CONNECTIONS:", require('util').inspect( connections, { depth: 1 } ) );

        // If tab is new, send a reset message
        if( tabIsNew ){
          consolelog("It's a new tab! Starting with a fresh 'reset' message")
          sendMessage( { type: 'reset', tabId: tabId }, function( err ){} );
        } else {
          consolelog("It's an existing tab! Since client is reconnecting, checking that queue is empty")
          sendMessagesInTab( tabId, function(){} );
        }

        ws.on('close', function connection(ws) {
          consolelog("Closing tabId:", tabId );

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
          consolelog('Received:', require('util').inspect( message, { depth: 10 } ) );

          try {
            message = JSON.parse( message );
          } catch( e ){
            consolelog("Could not interpret message!")
            return;
          }

          // Update lastSync since a message was received
          consolelog('Updating lastSync for that tab', tabId );
          stores.tabs.dbLayer.updateById( tabId, { lastSync: new Date() }, function( err ){
            if( err ) consolelog("Error updating lastSync!");
          });


          // Just making sure a user is not forging it, never trust anything from the client
          message.tabId = tabId;


          switch( message.type ){

            case 'ping':
              consolelog("Not propagating it since it's only a ping message. However, triggering check for messages in queue");
              sendMessagesInTab( message.tabId, function(){} );
            break;

            case 'register':
              consolelog("Adding subscription");

              var msg = {
                tabId: message.tabId,
                handle: message.handle,
              }
              if( typeof message.p1 !== 'undefined' ) msg.p1 = message.p1;
              if( typeof message.p2 !== 'undefined' ) msg.p2 = message.p2;
              if( typeof message.p3 !== 'undefined' ) msg.p3 = message.p3;
              if( typeof message.p4 !== 'undefined' ) msg.p4 = message.p4;
              msg.hash = makeSubscriptionHash( msg );

              stores.tabSubscriptions.dbLayer.selectByHash( { tabId: tabId }, function( err, total ){
                if( err ) consolelog("Error counting subscriptions for tabId", tabId, err );
                if( total > 30 ){
                  consolelog("Too many subscriptions", tabid, total );
                  return;
                }

                stores.tabSubscriptions.dbLayer.selectByHash( { hash: msg.hash }, function( err, total ){
                  if( err ) consolelog("Error registering:", msg, err );
                  if( total ){
                    consolelog("Handle already registered!");
                    return;
                  }

                  stores.tabSubscriptions.dbLayer.insert( msg, function( err, registerRecord ){
                    if( err ) consolelog("Error registering:", msg, err );

                    // *************************************
                    // This function ends here
                    // ************************************

                  });
                });
              });

            break;

            default:
              console.log("It's a proper message, propagating it now...");
              // Emit the comet event. This may result in
              stores.tabs.dbLayer.select( { }, function( err, tabs ){
                if( err ){
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
                  if( err ) consolelog("Error running emitAndSendMessages:", err );

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

      nested: [
        {
          type: 'multiple',
          store: 'tabMessages',
          join: { tabId: 'tabId'},
        },
      ]

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


/*
hotplate.hotEvents.onCollect( 'setRoutes', 'hotCoreComet', function( app, done ){

  hotCoreStore.get( function( err, s ){
    if( err ) return done( err );


    Object.keys( s.HotStore.registry ).forEach( ( k ) =>{
      var store = s.HotStore.registry[ k ];


      // TODO: take "|| true" out
      if( ( store.emitCometSignals )  && store.dbLayer ){

        [ 'simpledblayer-update-one', 'simpledblayer-delete-one', 'simpledblayer-insert', ].forEach( (op) => {

          console.log("Adding listener for", store.storeName, "for op:", op );
          store.dbLayer.onCollect( op, function( info, cb ){

            console.log("LISTENER FOR OP:", op, require('util').inspect( info, { dpeth: 2 }  ) );

            // TODO: You already have the session as options.request.session
            var makeSessionData = hotplate.config.get('hotCoreComet.makeSessionData');
            makeSessionData( info.options.request ? info.options.request._req : null, function( err, sessionData ){
              if( err ) return; // TODO LOG

              stores.tabs.dbLayer.select( { }, function( err, tabs ){
                if( err ) return; // TODO LOG

                var message = {
                  type: 'recordChange',
                  op: {
                    'simpledblayer-update-one': 'update',
                    'simpledblayer-delete-one': 'delete',
                    'simpledblayer-insert': 'insert',
                  }[ op ],
                  record: info.record,
                  storeName: store.storeName,
                };

                console.log("MESSAGE RECORD ABOUT TO SEND FOLLOWING UP:", message );

                // TODO: Try and work out tabId from headers if possible, behaviour will possibly do that
                emitAndSendMessages({
                  message: message,
                  sessionData: sessionData,
                  stores: stores,
                  connections: connections,
                  tabs: tabs,
                  fromClient: false
                }, function( err ){
                  if( err ) consolelog("Error runnign emitAndSendMessages:", err );

                  cb( null );
                });
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

*/
