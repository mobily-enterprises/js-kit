define([
  'dojo/_base/declare',
  'dijit/form/ValidationTextBox',
  ], function(
    declare
  , ValidationTextBox
  ){
    var Validators = sharedFunctions.hotCoreCommonValidators;

    return declare('hotplate/hotDojoAuth2/ValidationPassword', [ ValidationTextBox], {
      mustMatch: null, 
      validator:function(value){


        if(value == ''){
          this.invalidMessage = 'Password cannot be empty';
          return false;
        }

        if(this.mustMatch){
          if(value != this.mustMatch.get('value')){
            this.invalidMessage = 'Password must match';
            return false;
          }
        }

        return true;
      }
    });
  }
);
