define([
  'dojo/_base/declare',

  'dijit/form/ValidationTextBox',
  ], function(
    declare
  , ValidationTextBox
  ){
    return declare('app.ValidationEmail', [ ValidationTextBox ], {

      validator: function(value){

        //return true; // FIXME: DELETE THIS

        var validation =  Validators.email(value);
        if( ! validation.result ){
          this.invalidMessage = validation.message;
          return false;
        }
        return true;

      },

      // invalidMessage: "Username not valid",
      // missingMessage: "Username is a mandatory field",

    });

  }
);
