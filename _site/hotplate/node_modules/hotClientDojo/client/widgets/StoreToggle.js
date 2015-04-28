define([
  "dojo/_base/declare"

, "dojo/on"
, "dojo/when"
, "dojo/dom-class"
, "dojo/topic"

, "dijit/_WidgetBase"
, "dijit/_CssStateMixin"
, "dijit/_TemplatedMixin"
, "dijit/Destroyable"

, "hotplate/hotClientDojo/stores/stores"
, "hotplate/hotClientDojo/widgets/_OverlayMixin"
, "hotplate/hotClientDojo/submit/defaultSubmit"

], function(
  declare

, on
, when
, domClass
, topic

, _WidgetBase
, _CssStateMixin
, _TemplatedMixin
, Destroyable

, stores
, _OverlayMixin
, ds

){

  var templateString = '' +
    '<span>\n' +
    '  <span class="toggle"><span class="unticked" data-dojo-attach-point="toggleNode" data-dojo-attach-event="ondijitclick: click"></span></span>\n' +
    '</span>\n'+
    '';

  return declare( [ _WidgetBase, _TemplatedMixin, _CssStateMixin, _OverlayMixin ], {


    baseClass: 'toggle-widget',

    store: null,

    storeName: '',
    storeParameters: {},
    recordId: null,

    toggleField: '',

    templateString: templateString,

    ticked: false,

    postCreate: function(){
      this.inherited( arguments );
      var self = this;
      
        self.own(
        self.store.on( 'add,update,remove', function( event ){
          if( event.target[ self.store.idProperty ] == self.recordId ){
            self.set( 'ticked', event.target[ self.toggleField ] );
          }
        })
      );

    },

    postMixInProperties: function(){
      this.inherited(arguments);

      this.store = stores( this.storeName, this.storeParameters );      
    },

    _setTickedAttr: function( value ){
      this._set( 'ticked', value );
      
      // Remove all previous classes
      domClass.remove( this.toggleNode, 'ticked' );          
      domClass.remove( this.toggleNode, 'unticked' );          

      // Add the appropriate one
      if( value ){
        domClass.add( this.toggleNode, 'ticked' );          
      } else {
        domClass.add( this.toggleNode, 'unticked' );          
      }
        
    },

    // Toggle the 'ticked' attribute
    click: function( e ){

      var self = this;
      self.emit( 'toggle-click' );

      // Set futureValue to what the star will need
      // to be, and `o` accordingly
      var futureValue, o = {};
      if( self.ticked ){
        futureValue = false;
      } else {
        futureValue = true;
      }
      o[ self.toggleField ] = futureValue;
      o[ self.store.idProperty ] = self.recordId;
      
      // Try to save the values
      self.set('overlayStatus', { overlayed: true, clickable: false  } ); // LOADING ON
      when( self.store.put( o )) .then(
        function( res ){
          self.set('overlayStatus', { overlayed: false, clickable: false  } ); // LOADING OFF
          self.set( 'ticked', futureValue );
        },
        function( err ){
          self.set('overlayStatus', { overlayed: false, clickable: false  } ); // LOADING OFF
          (ds.UIErrorMsg( null, null, null ))(err); // Mainly for the global alert bar
        }
      );
    }

  });

});



