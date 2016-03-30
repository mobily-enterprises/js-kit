define( [

  "dojo/_base/declare"
, "dojo/dom-style"
, "dojo/_base/fx"
, "dojo/_base/lang"

], function(

  declare
, domStyle
, baseFx
, lang

){

  return declare( null, {

    fadeInInProgress: null,
    fadeOutInProgress: null,

    _transition:function(newWidget, oldWidget){


      // Needed later for calling this.inherited(arguments);
      var that = this;
      var a = arguments;

      // An animation was stopped: don't do the whole animation thing, reset everything,
      // called this.inherited(arguments) as if nothing happened
      if( this.fadeInInProgress || this.fadeOutInProgress ){

         // Stop animations
         this.fadeInInProgress ? this.fadeInInProgress.stop() : false;
         this.fadeOutInProgress ? this.fadeOutInProgress.stop() : false;

         // Reset opacity for everything
         domStyle.set(newWidget.domNode, "opacity", 1);
         domStyle.set(oldWidget.domNode, "opacity", 1);

         // call inherited(arguments) as if nothing happened
         this.inherited(arguments);
         return;
       }

      // ////////////////////////////////////////
      // // FADEOUT
      // ////////////////////////////////////////
      that.fadeOutInProgress = baseFx.fadeOut({
        node:oldWidget.domNode,
        duration: 250,
        onStop: function(){
          that.fadeOutInProgress = null;
        },

        // ////////////////////////////////////////
        // // FADEIN
        // ////////////////////////////////////////
        onEnd: function(){

          that.fadeOutInProgress = null;

          // Make the widget transparent, and then call inherited -- which will do the actual switch.
          domStyle.set(newWidget.domNode, "opacity", 0);
          that.inherited(a);

          // At this point the widget is visible, selected but transparent.
          // Let's fix that...
          that.fadeInInProgress = baseFx.fadeIn({
            node:newWidget.domNode,
            duration: 250,
            onStop: function(){
              that.fadeInInProgress = null;
            },
            onEnd: function(){
              that.fadeInInProgress = null;
            },
         }).play();
        }
      }).play();
    }
  });
});
