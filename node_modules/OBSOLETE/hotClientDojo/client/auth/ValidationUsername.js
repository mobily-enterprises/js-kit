define([

  "dojo/_base/declare"

, "dijit/form/ValidationTextBox"

, "hotplate/hotClientDojo/widgets/_AjaxValidatorMixin"
, "hotplate/hotClientDojo/stores/stores"

], function(

  declare

, ValidationTextBox
, _AjaxValidatorMixin
, stores

){
  var Validators = sharedFunctions.hotCoreCommonValidators;

  return declare( [ ValidationTextBox, _AjaxValidatorMixin ], {

    ajaxOkWhen: "present",
    ajaxInvalidMessage: "Ajax check failed",
    alwaysOk: null,

    validator: function( value ){

      // alwaysOk is always OK :D
      if( value === this.alwaysOk ) return true;

      // Run the normal field validators -- if they fail,
      // return false
      var validation =  Validators.loginValidator( value );
      if( ! validation ){
        this.invalidMessage = Validators.loginValidator( false );
        return false;
      }

      return this.ajaxValidate(value, {
         ajaxInvalidMessage: this.ajaxInvalidMessage,
         ajaxStore: stores('logins', {} ),
         ajaxFilterField: 'login',
         ajaxOkWhen: this.ajaxOkWhen,
      });

    },

    invalidMessage: Validators.loginValidator(false),
    missingMessage: Validators.notEmptyStringValidator(false),

  });
});
