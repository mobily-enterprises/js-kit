define([
  'dojo/_base/declare',
  'dijit/form/ValidationTextBox',
  ], function(
    declare
  , ValidationTextBox
  ){
    return declare('app.ValidationPassword', [ ValidationTextBox], {
      mustMatch: null, 
      validator:function(value){

        // return true; // FIXME: DELETE THIS

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
