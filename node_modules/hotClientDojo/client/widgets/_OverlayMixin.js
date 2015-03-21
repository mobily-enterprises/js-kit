define( [

  "dojo/_base/declare"
, "dojo/on"
, "dojo/dom"
, "dojo/dom-construct"
, "dojo/dom-attr"
, "dojo/dom-class"

, "dijit/Destroyable"

], function(

  declare
, on
, dom
, domConstruct
, domAttr
, domClass

, Destroyable

){


/* RULES:
  - Only unclickable overlays have to be displayed and then undisplayed in corresponding amount to take overlay away
  - If an overlay disappears of ANY kind, and the unclickableCounter is 0, the overlay is taken out
  - If unclickableCounter is > 1, after an undisplay then the overlay stays
  SO:
  - An application should listen to onOverlayClick and set the clickable overlay to `false`
  - An application that sets an unclickable overlay, NEEDS to have something in place that will take the overlay out as
    clicking won't do it
*/
  var setOverlayStatusFunc = function( status ){

    // Needs to be a valid object
    if( typeof( status ) !== 'object' || status === null ) return;

    // Get the parameter in the right format
    clickableParam = !! status.clickable;
    overlayedParam = !! status.overlayed;

    // Make sure both this._clickableCounter and this._overlaysCounter are numbers
    if( typeof( this._unclickableCounter ) !== 'number' ) this._unclickableCounter = 0;

    // Just in case: if the counter goes below 0,
    // reset it to 0
    if( this._unclickableCounter <= 0 ){
      this._unclickableCounter = 0; 
    }

    // Displaying an unclickable overlay? Increment _unclickableCounter.
    // UNdisplaying an unclickable overlay? DEcrement _unclickableCounter!
    if( overlayedParam && ! clickableParam ) this._unclickableCounter ++;
    if( !overlayedParam && ! clickableParam ) this._unclickableCounter --;

    // It will be overlayed if EITHER there are unclickable overlays, OR if one was requested
    var overlayed = this._unclickableCounter > 0 || overlayedParam;

    // It will be clickable if overlayed, and there aren't unclickable overlays
    var clickable = overlayed && this._unclickableCounter == 0;

    var status = { clickable: clickable, overlayed: overlayed };

    // Hide them both
    //domAttr.set( this.overlayReloadNode, { style: { display: 'none' } } );
    //domAttr.set( this.overlayLoadingNode, { style: { display: 'none' } } );

    domClass.replace( this.overlayReloadNode, 'overlay-hidden', 'overlay-displayed' );
    domClass.replace( this.overlayLoadingNode, 'overlay-hidden', 'overlay-displayed' );

    // If overlayed, show the right one (depending on whether the overlay
    // is meant to be clickable or not)
    if( overlayed ){
      if( clickable ){
        //domAttr.set( this.overlayReloadNode, { style: { display: 'block' } } );
        domClass.replace( this.overlayReloadNode, 'overlay-displayed', 'overlay-hidden' );
      } else {
        //domAttr.set( this.overlayLoadingNode, { style: { display: 'block' } } );
        domClass.replace( this.overlayLoadingNode, 'overlay-displayed', 'overlay-hidden' );
      }
    }
      
    if(this._set) this._set('overlayStatus', status );
    else this.overlayStatus = status;

  }

  return declare( Destroyable, {

    overlayStatus: { overlayed: false, clicked: false },

    constructor: function(){
      this.overlayStatus = { overlayed: false, clicked: false };

      // Create the overlay widget, place it as first in the widget
      this.overlayReloadNode = domConstruct.create('div', {
        className: 'overlay overlay-reload overlay-hidden', 
      } );

      // Create the overlay widget, place it as first in the widget
     this.overlayLoadingNode = domConstruct.create('div', {
        className: 'overlay overlay-loading overlay-hidden', 
      } );

    },

    postCreate: function(){
      var self = this;

      this.inherited(arguments);

      // Place the overlay now that I definitely have a domNode
      domConstruct.place( this.overlayReloadNode, this.domNode, 'first' );
      domConstruct.place( this.overlayLoadingNode, this.domNode, 'first' );

      this.own(

        on( self.overlayReloadNode, 'click', function(e){
          e.stopPropagation();
          if( self.overlayStatus.clickable ){
            on.emit( self.domNode, 'overlayClick', {  bubbles: false, cancelable: true } );
          }
        })

      );

    },

    // This is so that this mixin is compatible with _WidgetBase and with dgrid,
    // which have different formats for the set API
    _setOverlayStatus: setOverlayStatusFunc,
    _setOverlayStatusAttr: setOverlayStatusFunc,

  });

});
