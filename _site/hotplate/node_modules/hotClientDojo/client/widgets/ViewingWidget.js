define( [

  "dojo/_base/declare"
, "dojo/topic"
, "dojo/on"
, "dojo/when"
, "dojo/dom-class"
, "dojo/_base/lang"
, "dojo/promise/all"

, "dijit/_WidgetBase"
, "dijit/_TemplatedMixin"
, "dijit/_WidgetsInTemplateMixin"
, "dijit/form/TextBox"
, "dijit/Destroyable"
, 'dijit/layout/_ContentPaneResizeMixin'
, "dijit/_Container"


, "hotplate/hotClientDojo/submit/defaultSubmit"

, "hotplate/hotClientDojo/widgets/AlertBar"
, "hotplate/hotClientDojo/widgets/_OverlayMixin"
, "hotplate/hotClientDojo/stores/stores"

], function(

  declare
, topic
, on
, when
, domClass
, lang
, all

, _WidgetBase
, _TemplatedMixin
, _WidgetsInTemplateMixin
, TextBox
, Destroyable
, _ContentPaneResizeMixin
, _Container

, ds

, AlertBar
, _OverlayMixin
, stores

){

  return declare( [ _WidgetBase, _TemplatedMixin, _Container, _ContentPaneResizeMixin, _WidgetsInTemplateMixin, _OverlayMixin, Destroyable ] , {

    templateString: '<div><p>You need to set a template for this widget!</p></div>',

    // Information object
    info: {},
    _initialRender: false,

    constructor: function( params ){

      // Avoid pollution of prototype
      this.info = lang.mixin( this.info );

    },

    // Virtual method to be implemented by the inheriting widget
    // By default, it doesn't do anything. The point of it is to make sure
    // the template is updated with the values in this.info
    renderInfo: function(){
      
    },

    loadStoreData: function(){

      var self = this;

      self.set( 'overlayStatus', { overlayed: true, clickable: false } ); // LOADING ON

      var toLoad = {};
      Object.keys( self.info ).forEach( function( k ){
        var entry = self.info[ k ];
        if( entry.loadOnShow || ! self.info[ k ].data ){
          toLoad[ k ] = entry.store.get( entry.id );
        }
      });

      return all( toLoad ).then(

        function( res ){
          for( var k in res ){
            self.info[ k ].data = res[ k ];
          }
          self.renderInfo();
          self.set( 'overlayStatus', { overlayed: false, clickable: false } ); // LOADING OFF
          return res;
        },

        function( err ){
          self.set( 'overlayStatus', { overlayed: false, clickable: false } ); // LOADING OFF
          self.set( 'overlayStatus', { overlayed: true, clickable: true }  ); // CLICK ON
          throw( err );
        }
      );
    },

      
    postCreate: function(){
      this.inherited(arguments);

      var self = this;

      // Watch the 'update' event for the store: if received one,
      // it will have to check whether an entry in `info` needs to be
      // updated. If that is the case, it will also need to re-run self.renderInfo()
      Object.keys( self.info ).forEach( function( k ){

        var storeName = self.info[ k ].storeName || k;
        var storeParameters = self.info[ k ].storeParameters;

        //if( storeParameters === null ) debugger;

        var store = stores( storeName, storeParameters );
        self.info[ k ].store = store;

        store.on( 'update', function( e ){

          if( e.target[ store.idProperty ] == self.info[ k ].id ){
            self.info[ k ].data = e.target;
            self.renderInfo();
          }
        });
      });

     
      self.own(
        // When the form's overlay is clicked, try and show the form again
        on( self, 'overlayClick', function( e ){
          self.set( 'overlayStatus', { overlayed: false, clickable: true }  ); // CLICK OFF
          self.loadStoreData();
        })
      );

    }, // postCreate()


    // It calls updateInfo in the first widget's resize
    resize: function(){
     
     this.inherited(arguments);

     if( ! this._initialRender ){
        this._initialRender = true;
        this.loadStoreData();
      }
 
    },

    startup: function(){
      this.inherited(arguments);

      if( ! this._initialRender ){
        this._initialRender = true;
        this.loadStoreData();
      }     

    }

  });

});



