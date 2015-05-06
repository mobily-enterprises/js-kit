define([

  "dojo/_base/declare"

, "dijit/_WidgetBase"
, "dijit/_Container"
, "dijit/layout/_ContentPaneResizeMixin"

, "hotplate/hotClientDojo/stores/stores"
, "hotplate/hotClientDojo/globals/globals"

], function(

  declare

, _WidgetBase
, _Container
, _ContentPaneResizeMixin

, stores
, globals

){

  return declare([ _WidgetBase, _Container, _ContentPaneResizeMixin ], {

    strategyWidgets: {}, 
    strategyIds: null, 

    constructor: function( params ){

      var self = this;

      self.strategyWidgets = {};
    },

    postCreate: function(){
      var self = this;

      var resultSet;

      // The list of allowed strategyIds wasn't passed: get it from the page's global variable
      if( self.strategyIds === null) self.strategyIds = vars['hotCoreAuth']['strategyIds'];

      // TODO: If things go wrong, use overlay to cover things up.
      // Use overlay mixin to do this

      // Gets all of the user's strategies, in order to render
      // the Strategy managers property
      var store = stores( 'usersStrategies', { userId: this.userId } );
      resultSet = store.filter( {} ).fetch();
      resultSet.then( function( userStrategyDataList ){

        // This will ensure that all modules are required in the right order beforehand.
        // This makes the calls belog synchronous, since all of the modules will have been already loaded
        var toRequire = [];
        self.strategyIds.forEach( function( strategyId ){
          toRequire.push( 'hotplate/hotClientDojo/auth/auth/' + strategyId );
        });
        require( toRequire, function(){

          // Add a strategy manager for each managed strategy
          // REMEMBER: `require()` calls here will be synchronous, since the modules have already been loaded
          self.strategyIds.forEach( function( strategyId ){

            require( [ 'hotplate/hotClientDojo/auth/auth/' + strategyId ], function( Strategy ){        

              var userStrategyData = userStrategyDataList.filter( function( o ) { return o.strategyId == strategyId } )[0];

              var strategyWidget;
              self.strategyWidgets[ strategyId ] = strategyWidget = new Strategy.Manager( { userStrategyData: userStrategyData, resultSet: resultSet, store: store });
              strategyWidget.startup();
              self.addChild( strategyWidget );

            });
          });
        });        
      });

    }

  });
});





