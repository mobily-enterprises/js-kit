define( [

   "dojo/_base/declare"

,  "dijit/_WidgetBase"
,  "dijit/_TemplatedMixin"
,  "dijit/_WidgetsInTemplateMixin"

], function(

  declare

, _WidgetBase
, _TemplatedMixin
, _WidgetsInTemplateMixin

){

  return declare( [ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin ], {

    templateString: '<div><div class="auth-button" data-dojo-type="dijit/form/Button" data-dojo-attach-point="button" data-dojo-props="iconClass: \'auth-button-icon-all auth-button-icon-${strategyId}\'"></div></div>',

    'class': 'auth-button-container',

    strategyId: null,

    _displayError: function( err ){

      var message;

      // Try to get a nice message from err.response.data,
      // if not revert to err.message   
      if( typeof( err.response.data ) === 'string' ){
        try {
          err.response.data = JSON.parse( err.response.data );
        } catch( e ) {};

        if( typeof( err.response.data ) === 'object' ){
          message = err.response.data.message;
        } else {
          message = err.message;
        }                
      } else {
        message = err.message;
      }

      // Give out the alert
      alert( message );
    },

  });

});

