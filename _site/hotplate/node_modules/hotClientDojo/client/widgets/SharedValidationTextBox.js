define( [

  "dojo/_base/declare"

, "dijit/form/ValidationTextBox"

], function(

  declare

, ValidationTextBox

){

  return declare( [ ValidationTextBox ], {
    postMixInProperties: function(){
      this.inherited(arguments);

      if( ! this.sharedValidator ){
        throw new Error("Cannot use SharedValidationTextBox without defining a sharedValidator property")
      }

      this.validator = sharedValidators[ this.sharedValidator ];
      this.invalidMessage = sharedValidators[ this.sharedValidator ]( false );
    }
  });

});

