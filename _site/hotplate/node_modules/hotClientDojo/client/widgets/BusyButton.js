define( [

  "dojo/_base/declare"
, "dojo/aspect"

, "dojox/form/BusyButton",

], function(

  declare
, aspect

, DojoBusyButton

){
  return declare( [ DojoBusyButton ], {

    makeReallyBusy: function(){
      // summary:
      //    sets state from idle to busy
      this.isBusy = true;
      this.set("disabled", true);

      this.setLabel(this.busyLabel, this.timeout);
    },

    // Redefining this. It will NOT call inherited() and it will do NOTHING.
    makeBusy: function(){
    }


  });
});
