define( [

  "dojo/_base/declare"
, "dojo/topic"
, "dojo/on"

, "dijit/Destroyable"
, "dijit/form/Button"
, "dijit/Dialog"

], function(

  declare
, topic
, on

, Destroyable
, Button
, Dialog

){

  return declare( [ Dialog, Destroyable ], {

    startup: function(){
      this.inherited(arguments);
      this.show();
    },

    postCreate: function(){

      this.inherited(arguments);
      var self = this;

      // Honour the force-resize event
      this.own(
        on( self.domNode, 'force-resize', function( e ){
          self.resize();
        }) 
      );
        

      if( this.hideOn ){
        // Honour the hideOn attribute
        topic.subscribe( this.hideOn, function(){
          self.hide();
        });
      };
    },

    // Hiding this widget will destroy it. This widget is good for disposable dialogs
    hide: function(){

      var self = this;
      var p = self.inherited(arguments);

      // Attach a new callback triggered when the animation is over:
      // the callback will destroy the widget
      if( p ) {
        var newPromise = p.then( function(){
          self.destroyRecursive();
        });
        return newPromise;
      } else {
        return p;
      }
      

    },

  });

});

