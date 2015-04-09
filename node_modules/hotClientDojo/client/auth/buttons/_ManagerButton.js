define( [

  "dojo/_base/declare"
, "dojo/dom-class"
, "dojo/Deferred"

, "hotplate/hotClientDojo/widgets/ConfirmDialog"
, 'hotplate/hotClientDojo/stores/stores'
, 'hotplate/hotClientDojo/globals/globals'


, "./_SignInRecoverRegisterButton"

], function(

  declare
, domClass
, Deferred

, ConfirmDialog
, stores
, globals

, _SignInRecoverRegisterButton

){

  return declare( [ _SignInRecoverRegisterButton ], {

    templateString: '<div><div class="auth-button" data-dojo-type="dijit/form/Button" data-dojo-attach-point="button" data-dojo-props="iconClass: \'auth-button-icon-all auth-button-icon-${strategyId}\'"></div><div class="unticked" data-dojo-attach-point="accessIcon"></div></div>',

    userStrategyData: null,

    constructor: function( params ){
      var self = this;

      //  Create attributes that are local to the object
      self.userStrategyData = params.userStrategyData;

      // Observe the result set. If things change, the object
      // will update its internal values (`active` and `userStrategyData`) accordingly
      
      params.store.on('add, delete, update', function( event ){
        //console.log( 'EVENT:', event );

        //var id = event.type == 'remove' ? event.id : params.store.getIdentity( event.target );
        var id = params.store.getIdentity( event.target );
        //console.log( 'ID:', id );
        //console.log( 'self.userStrategyData:', self.userStrategyData );



        // This event is fired for each button. So, here each button is checking
        // whether the event was for itself or not
        

        // TODO: decide if for `delete` and `update` I should follow the same
        // if as `add` rather than checking userStrategyData.id
        switch( event.type ){

          case 'delete':
      
            if( self.userStrategyData && id == self.userStrategyData.id ) {
              self.set( 'active', false );
              self.set( 'userStrategyData', null );
            }
          break;

          case 'add':
            if( globals.userId == event.target.userId && self.strategyId === event.target.strategyId ){
              self.set( 'active', true );
              self.set( 'userStrategyData', event.target );          
            }
          break;

          case 'update':
            if( self.userStrategyData && id == self.userStrategyData.id ) {
              self.set( 'userStrategyData', event.target );
            }
          break;
        }
      });

    },


    postCreate: function(){
      var self = this;

      this.inherited(arguments); 

      if( self.userStrategyData ) self.set( 'active', true );
    },

    // When set as "active", it will give visual feedback 
    _setActiveAttr: function( value ){
      this._set( 'active', value );
     
      if( value ){
        domClass.add( this.accessIcon, 'ticked' );
        domClass.remove( this.accessIcon, 'unticked' );
      } else {
        domClass.add( this.accessIcon, 'unticked' );
        domClass.remove( this.accessIcon, 'ticked' );
      }
    }, 


    _deleteStrategyData: function( title, content ){

      var self = this;
      deferred = new Deferred();

      var myDialog = new ConfirmDialog({
        title: title,
        content: content,
      });
      myDialog.startup();
      myDialog.on( 'dialogconfirmed', function( e ){


         var store = stores( 'usersStrategies', { userId: globals.userId } );       
         store.remove( self.userStrategyData.id ).then(

          function( r ){

            self.userStrategyData = null;
            deferred.resolve( true );
            return r;
          },
          function( err ){
            (new ConfirmDialog( { cancelButton: false, title: "Failed", content: "Operation failed" })).startup();
            deferred.reject( err );
            console.log(err);
            throw( err );
          }
        );
      });

      return deferred.promise
    },

  });

});

