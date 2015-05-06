define([

  "dojo/_base/declare"

, "dijit/_WidgetBase"
, 'dijit/_Container'
, 'dijit/layout/_ContentPaneResizeMixin'

], function(
  declare

, _WidgetBase
, _Container
, _ContentPaneResizeMixin

){

  return declare([ _WidgetBase, _Container, _ContentPaneResizeMixin ], {

    strategyWidgets: {}, 
    strategyIds: null, 
    action: 'signin',


    constructor: function( params ){
      var self = this;
      self.strategyWidgets = {};

      self.action = params.action || 'signin';

    },

    postCreate: function(){
      var self = this;

      // The list of allowed strategyIds wasn't passed: get it from the page's global variable
      if( self.strategyIds === null) self.strategyIds = vars['hotCoreAuth']['strategyIds'];

      var methodMap = {
        signin: 'SignIn',
        recover: 'Recover',
        register: 'Register',
      };


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
          var strategyWidget;      
          require( [ 'hotplate/hotClientDojo/auth/auth/' + strategyId ], function( Strategy ){        
            self.strategyWidgets[ strategyId ] = strategyWidget = new Strategy[ methodMap[ self.action] ]();
            strategyWidget.startup();
            self.addChild( strategyWidget );
          });
          
        });

      });


    }

  });
});





