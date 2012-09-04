define([
  'dojo/_base/declare',
  'dojo/_base/lang',

  "hotplate/baseProtocol/main",

  ], function(
    declare
  , lang

  , protocol


  ){
    return  declare(null, {

      ajaxResponse: {},

      constructor: function(){

        // Declaring object variable in constructor to make sure that
        // they are not class-wide (since they will be in the prototype)
        this.ajaxResponse = {};
      },

      // Overloads the validator, adding extra stuff
      ajaxValidate: function(value, options){

        // Set some defaults
        options.ajaxInvalidMessage = options.ajaxInvalidMessage || "Ajax check failed (2)";
        options.ajaxStore = options.ajaxStore || null;
        options.ajaxFilterField = options.ajaxFilterField  || 'name';
        options.ajaxOkIfPresent = options.ajaxOkIfPresent  || false;

        options.ajaxOkIfAbsent = ! options.ajaxOkIfPresent; // This is for code redability

        // No ajaxStore query available, return true  regardless
        if( ! options.ajaxStore ){
          return true;
        }

        if( options.ajaxOkIfAbsent && this.ajaxResponse[value] == 'present' ) {
          this.invalidMessage = options.ajaxInvalidMessage;
          return false;
        }

        if( options.ajaxOkIfPresent && this.ajaxResponse[value] == 'absent' ) {
          this.invalidMessage = options.ajaxInvalidMessage;
          return false;
        }

        // If the value isn't cached, then cache it. Then, once Ajax has returned,
        // run this.validate() which will re-run this check -- which at that point
        // will have its value in the cache
        if( typeof( this.ajaxResponse[value]) == 'undefined' ){

          // Make up the filter object, which will be passed to .query() shortly
          var filterObject = {};
          filterObject[options.ajaxFilterField] = value;

          // Actually runs the query
          options.ajaxStore.query( filterObject ).then(
            lang.hitch(this, function(res){

              var goodRes;

              // Makes sure the result is 'good' (following
              // the standard)
              goodRes = protocol.fixResponse(res);

              if( goodRes.data.length ){
                this.ajaxResponse[value] = 'present';
                //console.log("Added to Ajaxfailed: " + value);
                this.validate();
              } else {
                //console.log("Added to Ajaxsuccess: " + value);
                this.ajaxResponse[value] = 'absent';
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

