define( [

  "dojo/_base/declare"

, "dojo/topic"

, "hotplate/hotClientDojo/auth/panels/Resume"
, "hotplate/hotClientDojo/widgets/TempDialog"

], function(
  declare

, topic

, Resume
, TempDialog

){

  return declare( null, {

    postCreate: function(){
      var self = this;

      this.inherited(arguments);

      topic.subscribe( 'hotClientDojo/auth/unauthorized', function( ){

        var tempDialog = new TempDialog( {
          title: "Authenticate",
          hideOn: "hotClientDojo/auth/resuming",
        } );

        // Make a dialog with the strategies store
        var r = new Resume();
        tempDialog.addChild( r );
        tempDialog.startup();
      });

    },
 });
});

