
  if( typeof Hotplate == 'undefined' ) Hotplate = {};

  (function() {
    // 'use strict';

    function hashCode( s ){
      var hash = 0, i, chr, len;
      if (s.length === 0) return hash;
      for (i = 0, len = s.length; i < len; i++) {
        chr   = s.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    };

    function objectHash( o ) {
      return hashCode( JSON.stringify( o ) ) ;
    }
    /*
        window.addEventListener('online', function(){  object.data.browserStatus='online'; } );
        window.addEventListener('offline', function(){ object.data.browserStatus='offline'; } );
    */


    // http://stackoverflow.com/a/27747377/829771
    function maketabId(){

      // dec2hex :: Integer -> String
      function dec2hex (dec) {
        return dec.toString(16)
      }

      // generateId :: Integer -> String
      function generateId (len) {
        var arr = new Uint8Array((len || 40) / 2)
        window.crypto.getRandomValues(arr)
        return Array.from(arr).map(dec2hex).join('')
      }

      return generateId( 24 );
    }


    /*
    // TESTING: Attempt to send messages every 10 seconds
    setInterval( function(){
      object.sendWs( { greetings: "Hello from the client"});
      console.log("***************************Messages in queue:", Object.keys( object.data.messageQueue).length );
    }.bind(this), 2000 );
    */


    /*
    // TESTING: Attempt to send messages every 10 seconds
    setInterval( function(){
      object.sendWs( { type: 'register', handle: "group-message", p1:"the-group-id" } );
    }.bind(this), 2000 );
    */


    var messageIdGenerator = 0;
    var object = Hotplate.cometClient = {

      /* Properties */
      data: {
        virgin: true,
        status: 'neveropened',
        subscribers:  [],
        tabId: maketabId(),
        url: '',
        protocol: '',
        reopenDelay: 5000,
        resendDelay: 5000,
        pingInterval: 20000,
        socket: null,
        messageQueue: {},
      },

      /* Methods */

      _ws_onOpen: function( e ){
        console.log("Websocket opened");

        var originalStatus =  this.data.status;
        if( originalStatus != 'neveropened' ){
          console.log("It wasn't the first time! ");
        }

        console.log("Setting status to 'open'");
        this.data.status = "open";

        this._ws_sendQueue();
      },

      _ws_onError: function( e ){
        console.log("Websocket received an error:", e );
      },

      _ws_onClose: function( e ){
        console.log("Websocket closed, reattempting opening later");
        this.data.status = 'closed';

        this._ws_reopenLater();
      },

      _ws_reopenLater: function(){
        console.log("Reopening in these many milliseconds:", this.data.reopenDelay );
        setTimeout( function(){
          console.log("Reopening now!" );
          this.open();
        }.bind(this), this.data.reopenDelay );
      },


      _ws_onMessage: function( e ){
        var message = e.data;

        console.log("Message received from server!", this.data.virgin);

        try {
          message = JSON.parse( message );
        } catch( e ){
          console.log("Message malformatted, quitting...");
          return;
        }

        // Kidnap the first 'reset' message, since it was
        // due to the fact that this is a fresh connection.
        // Subsequent 'reset' messages will be important as they mean
        // that the server sees the connection as a fresh one
        if( message.type == 'reset' && this.data.virgin ){
          console.log("It's a reset on a virgin connection: no longer virgin, but kidnapped", this.data.virgin );
          this.data.virgin = false;
          this.data.messageQueue = {};
          return;
        }

        console.log("Reset came from a non-virgin connection!", this.data.virgin);

        // A 'reset' from the server at this point is surely because WE
        // were inactive for a long time. A 'reset' will imply that the messageQueue
        // needs to be zapped.
        if( message.type == 'reset' ){
          this.data.messageQueue = {};
        }

        // A message arrived: broadcast it to subscribers
        console.log("Broadcasting message to subscribing elements..." );
        this._ws_notifySubscribers( message );
      },

      _ws_sendQueue: function(){

        console.log("Entered sending queue...")
        if( this.inSendQueue ){
          console.log("Got out of sending queue since it's already there");
          return;
        }

        if( this.data.status != 'open') {
          console.log("Got out of sending queue since status is not open");
          return;
        }

        if( Object.keys( this.data.messageQueue ).length == 0 ){
          console.log("Nothing to send, quitting");
          this.inSendQueue = false;
          return;
        }

        console.log("ACTUALLY entered sending queue, broadcasting messages: ", Object.keys( this.data.messageQueue ).length );

        for( var k in this.data.messageQueue ){

          // Dealing with tne message
          var message = this.data.messageQueue[ k ];

          // Try and send it
          try {
            console.log("Attempting to send...", message );
            this.data.socket.send( JSON.stringify( message ) );
            this.data.lastSync = new Date();
            delete this.data.messageQueue[ 'm-' + message.messageId ];
          } catch( e ){
            console.log("Error sending message!", message.messageId, err );
            break;
          }

        }
        this.inSendQueue = false;
      },

      _ws_ping: function() {
        this.data.socket.send( JSON.stringify( { type: 'ping', messageId: messageIdGenerator++, tabId: this.data.tabId } ) );
        this.data.lastSync = new Date();
      },

      _ws_notifySubscribers: function( message ) {

        console.log("Sending message to local subscribers:", this.data.subscribers.length, message )
        for (var i = 0; i < this.data.subscribers.length; ++i) {
          console.log("Considering sending to subscriber", i - 1 );

          if( ! message.fromTabId ||  message.fromTabId != this.data.tabId ){
            console.log("OK sending..." );
            this.data.subscribers[ i ].wsMessage( message );
          } else {
            console.log("Won't be sending it as it's from self!" );
          }
        }
      },


      open: function( url, protocol ){

        this.data.url = url || this.data.url;
        this.data.protocol = this.data.protocol || protocol;

        var finalUrl = this.data.url+"?tabId=" + this.data.tabId;
        console.log("Opening:", finalUrl, this.data.protocol );

        this.data.socket = new WebSocket( finalUrl, this.data.protocol );
        this.data.socket.onerror = this._ws_onError.bind( this );
        this.data.socket.onopen = this._ws_onOpen.bind( this );
        this.data.socket.onclose = this._ws_onClose.bind( this );
        this.data.socket.onmessage = this._ws_onMessage.bind( this );
      },

      sendWs: function( message ){
        console.log("Putting message in sending queue...", message );

        message.tabId = this.data.tabId;
        message.messageId = messageIdGenerator++;
        message.added = new Date();

        this.data.messageQueue[ 'm-' + message.messageId ] = message;

        console.log("Sending messages in queue...", message );
        this._ws_sendQueue();
      },

      sendLocal: function( message ){
        console.log("Sending message to local subscribers...")
        console.log( message );
        this._ws_notifySubscribers( message );
      },

      addSubscriber: function( subscriber ){
        console.log("Adding subscriber:", subscriber.is );
        this.data.subscribers.push( subscriber );
      },

      deleteSubscriber: function( subscriber ){
        var index = this.data.subscribers.indexOf(this);
        if (index < 0) {
          return;
        }
        this.data.subscribers.splice(index, 1);
      },

    }

    setInterval( function(){
      object._ws_sendQueue();
    }, object.data.resendDelay );


    // This will send a ping *roughly* every minute -- as long as
    // the connection is open. If not, secondsFromLastPing will continue
    // to grow and grow, and eventually when the connection is open again
    // it will ping again
    var CHECKINTERVAL = 5;
    var PINGEVERY = object.data.pingInterval;
    var secondsFromLastPing = 0;
    setInterval( function(){
      console.log("Checking if I should be sending ping out...")
      if( object.data.status == 'open' && secondsFromLastPing >= PINGEVERY ){
        console.log("I should! Connection is open and", secondsFromLastPing, 'is bigger than', PINGEVERY )
        object._ws_ping();
        secondsFromLastPing = 0;
      } else {
        console.log("Nope! Either connection is not open or", secondsFromLastPing, 'is smaller than', PINGEVERY )
        secondsFromLastPing += CHECKINTERVAL;
      }
    }, 1000 * CHECKINTERVAL );

  })();
