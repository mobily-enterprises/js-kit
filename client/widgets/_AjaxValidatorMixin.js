define([
  'dojo/_base/declare',
  'dojo/_base/lang',

  'app/lib/globals', // TODO: FIND OUT WHY ADDING THIS BREAKS _EVERYTHING_
  ], function(
    declare
  , lang
  , g

  ){
    return  declare(null, {

      ajaxSaidNo: {},
      ajaxSaidYes: {},
      ajaxRequested: {},

      constructor: function(){

        // Declaring object variable in constructor to make sure that
        // they are not class-wide (since they will be in the prototype)
        this.ajaxSaidNo = {};
        this.ajaxSaidYes = {};
        this.ajaxRequested = {};
      },

      // Overloads the validator, adding extra stuff
      ajaxValidate: function(value, options){

        // Set some defaults
        options.ajaxInvalidMessage = options.ajaxInvalidMessage || "Value not allowed";
        options.ajaxStore = options.ajaxStore || null;
        options.ajaxFilterField = options.ajaxFilterField  || 'name';

        // No ajaxStore query available, return true
        if( ! options.ajaxStore ){
          return true;
        }

        // console.log("Started validation for " + value);
        // Ajax has already said no -- returning false straight away
        if(this.ajaxSaidNo[value] ){
          this.invalidMessage = options.ajaxInvalidMessage;
          return false;
        }

        // console.log("OK, ajasSaidYes for " + value + " is " +  this.ajaxSaidYes[value]); 
        if(! this.ajaxSaidYes[value] ){
          var filterObject = {};
          filterObject[options.ajaxFilterField] = value;
          options.ajaxStore.query( filterObject ).then(
            lang.hitch(this, function(res){
              if(res && res.length ){
                this.ajaxSaidNo[value] = true;
                //console.log("Added to Ajaxfailed: " + value);
                this.validate();
              } else {
                //console.log("Added to Ajaxsuccess: " + value);
                this.ajaxSaidYes[value] = true;
                this.validate();
              }
            })
          );    
        }  

        return true;
      }

    });
  }
);

