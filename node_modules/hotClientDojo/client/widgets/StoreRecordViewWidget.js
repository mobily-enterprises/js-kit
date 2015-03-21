define( [

  "dojo/_base/declare"
, "dojo/topic"
, "dojo/on"
, "dojo/when"
, "dojo/dom-class"
, "dojo/_base/lang"

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

    storeName: '',
    storeParameters: {},
    storeExtraParameters: {},

    recordId: null,
    baseClass: 'record-view-widget',

    // Internal store variable
    store: null,

    // Internal "first resize" status variable
    _firstResize: true,

    defaultData: {},

    dataRefresh: function(){ },


    constructor: function(){ },

    postMixInProperties: function(){
      this.inherited(arguments);

      // Copy attribute over from the prototype
      this.storeExtraParameters = lang.mixin( this.storeExtraParameters );

      // Mixin the extra parameters with storeParameters
      this.storeParameters = lang.mixin( {}, this.storeParameters, this.storeExtraParameters );

      // Make up the store internal variable
      this.store = stores( this.storeName, this.storeParameters );
    },

    postCreate: function(){
      this.inherited(arguments);

      var self = this;

      self.own(

        // When the form's overlay is clicked, try and show the form again
        on( self, 'overlayClick', function( e ){
          self.set( 'overlayStatus', { overlayed: false, clickable: false }  ); // CLICK OFF
          self.loadInfo();
        }),

        // Check self the record doesn't get updated by remote
        topic.subscribe('storeRecordUpdate,storeRecordCreate', function( from, message, remote ){

          if( message.storeName === self.storeName && message.objectId == self.recordId ){
            self.refreshData( message.object );  
          }
        })
      );

    }, // postCreate()

    // It calls updateInfo in the first widget's resize
    resize: function(){
     
     this.inherited(arguments);

     if( this._firstResize ){
        this._firstResize = false;
        this.loadInfo();
      }
 

 
    },

    // loadInfo
    loadInfo: function(){

      this.inherited(arguments);

      var self = this;

      // ****************************************************************
      // There is a recordId set: it's the update of an existing value
      // ****************************************************************
      if( self.recordId ){
       
        when( this.store.get( self.recordId )).then(
          function( res ){
            return res;
          },
          function( err ){
            if( err.status == 404 ){
              return self.defaultData;
            } else {
              throw( err );
            }
          }
        ).then(
          ds.UIMsg(),
          ds.UIErrorMsg( null, null, null )
        ).then(
          function( res ){

            // Widget will need to refresh its data
            self.refreshData( res );
            return res;

          },
          function( err ){
            self.set( 'overlayStatus', { overlayed: true, clickable: true } ); // CLICK ON

            // Error handlers need to rethrow...
            throw( err );
          }
        );

      // ****************************************************************
      // There is no recordId set: simply show defaults
      // ****************************************************************
      } else {
      }
    },

    destroy: function(){
      this.inherited(arguments);

      var self = this;

    },

  });

});



