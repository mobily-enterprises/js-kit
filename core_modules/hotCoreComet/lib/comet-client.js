
  if( typeof Hotplate == 'undefined' ) Hotplate = {};


  (function() {
    // 'use strict';


    var consolelog = function(){
      if( Hotplate && Hotplate.debugCometClient ) {
        console.log.apply( console, arguments );
      }
    }


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


    var messageIdGenerator = 0;
    var object = Hotplate.cometClient = {

      /* Properties */
      data: {
        virgin: true,
        status: 'neveropened',
        subscribers:  [],
        tabId: maketabId(),
        url: '',
        protocol: undefined,
        reopenDelay: 5000,
        resendDelay: 5000,
        pingInterval: 20000,
        socket: null,
        messageQueue: {},
      },

      /* Methods */

      _ws_onOpen: function( e ){
        consolelog("Websocket opened");

        var originalStatus =  this.data.status;
        if( originalStatus != 'neveropened' ){
          consolelog("It wasn't the first time! This means that this is a re-opening after closure.");
        }

        consolelog("Setting status to 'open'");
        this.data.status = "open";
        this._ws_notifyStatusChange('open');

        this._ws_sendQueue();
      },

      _ws_onError: function( e ){
        consolelog("Websocket received an error:", e );
      },

      _ws_onClose: function( e ){
        consolelog("Websocket closed, reattempting opening later");
        this.data.status = 'closed';
        this._ws_notifyStatusChange('closed');

        this._ws_reopenLater();
      },

      _ws_reopenLater: function(){
        consolelog("Reopening in these many milliseconds:", this.data.reopenDelay );
        setTimeout( function(){
          consolelog("Reopening now!" );
          this.open();
        }.bind(this), this.data.reopenDelay );
      },


      _ws_onMessage: function( e ){
        var message = e.data;

        consolelog("Message received from server!");

        try {
          message = JSON.parse( message );
        } catch( e ){
          consolelog("Message malformatted, quitting...");
          return;
        }

        // Kidnap the first 'reset' message, since it was
        // due to the fact that this is a fresh connection.
        // Subsequent 'reset' messages will be important as they mean
        // that the server sees the connection as a fresh one
        if( message.type == 'reset' && this.data.virgin ){
          consolelog("It's a reset on a virgin connection: was still waiting for first reset, which has arrived" );
          consolelog("Reset message won't be broadcast" );
          this.data.virgin = false;
          this.data.messageQueue = {};
          return;
        }

        consolelog("Reset came from a non-virgin connection!", this.data.virgin);

        // A 'reset' from the server at this point is surely because WE
        // were inactive for a long time. A 'reset' will imply that the messageQueue
        // needs to be zapped.
        if( message.type == 'reset' ){
          this.data.messageQueue = {};
        }

        // A message arrived: broadcast it to subscribers
        consolelog("Broadcasting message to subscribing elements..." );
        this._ws_notifySubscribers( message );
      },

      _ws_sendQueue: function(){

        consolelog("Entered sending queue...")
        if( this.inSendQueue ){
          consolelog("Got out of sending queue since it's already going");
          return;
        }

        if( this.data.status != 'open') {
          consolelog("Got out of sending queue since status is not open");
          return;
        }

        if( Object.keys( this.data.messageQueue ).length == 0 ){
          consolelog("Nothing to send, quitting");
          this.inSendQueue = false;
          return;
        }

        consolelog("There are messages in the queue. Broadcasting these many:", Object.keys( this.data.messageQueue ).length );

        for( var k in this.data.messageQueue ){

          // Dealing with tne message
          var message = this.data.messageQueue[ k ];

          // Try and send it
          try {
            consolelog("Attempting to send...", message );
            this.data.socket.send( JSON.stringify( message ) );
            consolelog("Sending to socket successful!", message );
            this.data.lastSync = new Date();
            delete this.data.messageQueue[ 'm-' + message.messageId ];
          } catch( e ){
            consolelog("Error sending message!", message.messageId, err );
            break;
          }

        }
        this.inSendQueue = false;
      },

      _ws_ping: function() {
        this.data.socket.send( JSON.stringify( { type: 'ping', messageId: messageIdGenerator++ } ) );
        this.data.lastSync = new Date();
      },


      _ws_notifyStatusChange: function( status ) {

        consolelog("Sending status change local subscribers:", status )
        for (var i = 0; i < this.data.subscribers.length; ++i) {
          var subscriber = this.data.subscribers[ i ];
          if( subscriber.wsStatusChange ) subscriber.wsStatusChange( status );
        }
      },


      _ws_notifySubscribers: function( message ) {

        consolelog("Sending message to local subscribers:", this.data.subscribers.length, message )
        for (var i = 0; i < this.data.subscribers.length; ++i) {
          var subscriber = this.data.subscribers[ i ];
          if( subscriber.wsReset && message.type == 'reset' ) subscriber.wsReset( message );
          if( subscriber.wsMessage ) subscriber.wsMessage( message );
        }
      },


      open: function(){

        var finalUrl = this.data.url+"?tabId=" + this.data.tabId;

        consolelog("Opening:", finalUrl, this.data.protocol );

        this.data.socket = new WebSocket( finalUrl, this.data.protocol );
        this.data.socket.onerror = this._ws_onError.bind( this );
        this.data.socket.onopen = this._ws_onOpen.bind( this );
        this.data.socket.onclose = this._ws_onClose.bind( this );
        this.data.socket.onmessage = this._ws_onMessage.bind( this );
      },

      close: function(){
        this.data.socket.close();
      },

      sendWs: function( message ){
        consolelog("Putting message in sending queue...", message );

        message.messageId = messageIdGenerator++;
        message.added = new Date();

        this.data.messageQueue[ 'm-' + message.messageId ] = message;

        consolelog("Running sendQueue, which will send this message...", message );
        this._ws_sendQueue();
      },

      sendLocal: function( message ){
        consolelog("Sending message to local subscribers...", message )
        this._ws_notifySubscribers( message );
      },

      addSubscriber: function( subscriber ){
        consolelog("Adding subscriber:", subscriber.is );
        this.data.subscribers.push( subscriber );
      },

      deleteSubscriber: function( subscriber ){
        consolelog("Deleting subscriber:", subscriber.is );
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
    var CHECKINTERVAL = 5000;
    var PINGEVERY = object.data.pingInterval;
    var secondsFromLastPing = 0;
    setInterval( function(){
      consolelog("Checking if I should be sending ping out...")
      if( object.data.status == 'open' && secondsFromLastPing >= PINGEVERY ){
        consolelog("I should! Connection is open and", secondsFromLastPing, 'is bigger than', PINGEVERY )
        object._ws_ping();
        secondsFromLastPing = 0;
      } else {
        consolelog("Nope! Either connection is not open or", secondsFromLastPing, 'is smaller than', PINGEVERY )
        secondsFromLastPing += CHECKINTERVAL;
      }
    }, CHECKINTERVAL );

  })();
