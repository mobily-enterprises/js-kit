define([
  'dojo/_base/declare',
  'dojo/query',
  'dojo/aspect',
  'dojo/_base/lang',
  'dojo/_base/json',
  'dojo/text!app/widgets/templates/RetypePassword.html',

  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  'dijit/registry',
  'dijit/Tooltip',


  "app/lib/globalWidgets",
  "app/lib/Logger",
  "app/lib/stores",

  'app/widgets/ValidationPassword',
  "app/widgets/AlertBar",
  "app/widgets/BusyButton",


  ],function(
    declare
  , query
  , aspect
  , lang
  , json
  , retypePasswordTemplateString

  , _WidgetBase
  , _TemplatedMixin
  , _WidgetsInTemplateMixin
  , registry
  , Tooltip

  , gw
  , Logger
  , stores

  , ValidationPassword
  , AlertBar
  , BusyButton

  ){

  var r = {}

  r.defaultSubmit = function(form, button, callback){

    return function(e){

      // Prevent the default
      e.preventDefault();

      // Make the button busy
      button ? button.makeReallyBusy() : null;

      // Validate the form
      form.validate();
      if(! form.isValid() ){
        Logger("Didn't validate, cancelling");
        button ? button.cancel() : null;
      } else {

        // Call the callback
        callback();

        // Prevent form submission (it will be submitted through Ajax)
        return false;
      }

    }
  }


  r.RetypePasswordDialog = declare("app.RetypePasswordDialog", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: retypePasswordTemplateString,

    show: function(){
      this.dialog.show();
    },

    postCreate: function(){
      that = this;


      this.form.onSubmit = r.defaultSubmit(this.form, this.button, function(){

        // Get the form's values
        var data = that.form.getValues();
        data.login = loginValue; // NOTE: this is loginName "the" global variable

        // Store the data 
        stores.loginAnon.put(data).then(
          r.UIMsg('ok', that.form, that.button, that.alertBar ),
          r.UIMsg('error', that.form, that.button, that.alertBar, true )
        ).then(
          function(res){
            Logger("Jsonrest put(data) returned OK: " + json.toJson(res) );
            that.button.cancel();

            // Reset things so that it will look right if it happens again
            that.form.reset();
            that.alertBar.hide();
            that.dialog.hide();
            r.RetypePasswordDialog.failureCounts = 0;
          },
          function(err){
            that.form.reset();
            r.RetypePasswordDialog.failureCounts ++;
            if( r.RetypePasswordDialog.failureCounts > 2){
              window.location="/login";
            }
          }
        );  // stores.loginanon.put(data)



        return false;    
      });

    }

  });
  r.RetypePasswordDialog.failureCounts = 0;



  r.retypePasswordDialog = r.RetypePasswordDialog();



  // Function to show error messages on JsonRest put() and post() calls
  //
  r.UIMsg = function( type, form, button, alertBar, noLogin ){

    if( type == 'ok') {
      // AJAX JsonRest success let's see what was returned!
      return  function(res){

         if(! res){
          // ***************************************
          // BAD: RESPONSE FROM THE SERVER WAS EMPTY
          // This happens on connection refused
          // ***************************************

          // Cancel the submit button
          button ? button.cancel() : null;

          // Show the error at application level
          gw.appAlertBar.set('message', 'Connection to server failed');
          gw.appAlertBar.show(5000);

          Logger("Got an empty result from xhr call");
          throw(new Error("Empty result from xhr call"));
        } else {


          // Cancel the submit button
          button ? button.cancel() : null;
          Logger("The form was accepted by the server");

          // Ready for the next chained call
          return res;
        }

        
      }
    }


    if( type == 'error'){


      // AJAX JsonRest failure: set error messages etc. and rethrow
      return function(err){

        switch(err.status){

          // Field validation error
          case 422:
            res = json.fromJson(err.responseText);

            // ***********************************************
            // WATCH OUT: RESPONSE FROM THE SERVER WAS "ERROR"
            // ***********************************************

            // This array will contain the list of widgets for which the server
            // didn't like values, but didn't enforce a change before re-submitting
            var artificialErrorWidgets = [];

            res.forEach( function(error){
    
              if( error.field == ''){

                // Error without field: show it in the form's alertBar (if AlertBar present)
                // TODO: Maybe if the alertbar is not defined display in main bar
                if( alertBar) {
                  alertBar.set('message','Error: ' + error.message);
                  alertBar.show(); // Persistent
                }

              } else {

                // Get the widget by its name. 
                var field = query("form#"+form.id+" input[name='" + error.field + "']");
                

                if(field.length && field[0].id && (widget = registry.byId( field[0].id ) ) ){

                  // Add a validator around it if the error is "persistent" (the client
                  // never wants that value again)
                  if(error.mustChange){

                    // Create a new badValue variable which contains the "bad apple"
                    var badValue = widget.get('value');
  
                    // Use Dojo aspects to add an extra check to the original widget's
                    // validation function, so that the client will never ever serve
                    // that function again
                    //aspect.around(widget, 'validator', function(originalValidator){
                    aspect.around(widget, 'validator', function(originalValidator){
                      return function(value){
                        console.log("MIDDLE MAN STARTED AND THIS IS: " + widget.id);
                        console.log(this);
                        if( value == badValue){
                          this.invalidMessage = error.message;
                          return false;
                        } else {
                          // TODO: FIND OUT WHY WE NEED THIS "call"
                          // return originalValidator(value);
                          return originalValidator.call(this, value);
                        }
                      };
                    });

 
                  } else {

                    // Populates the array containing widgets for which an error will
                    // be raised artificially (not persistent) AFTER validation is forced
                    // (see below)
                    artificialErrorWidgets.push( { widget: widget, message: error.message }); 
                  }

                } else {
                  Logger("Widget not found: " + error.field);
                  alertBar.show(); // Persistent
                }
              }

            });                      

            // Now that we might possibly have more validators attached,
            // get the form to validate again
            form.validate();

            // Artificially (VERY artificially) get the error to show. This is not due to
            // validation, so as soon as the focus is there, it will disappear
            artificialErrorWidgets.forEach(function(w){ 
              widget = w.widget;
              message = w.message;
              widget.set('state','Error')
              Tooltip.show(message, widget.domNode, widget.tooltipPosition, !widget.isLeftToRight());
            });

            // Cancel the submit button
            button ? button.cancel() : null;

            Logger("Response came back with validation errors: " + json.toJson(res) );
            throw(err);
          break;   

          case 403:

            button ? button.cancel() : null;

            // Only show the alert and the problems if the noLogin flag is false. This flag is basically for
            // the login form and the recoverPassword form and for the workspace form
            if(! noLogin){

              // Show the error at application level
              gw.appAlertBar.set('message', 'Authentication problem');
              gw.appAlertBar.show(5000);
              r.retypePasswordDialog.show();
            }

            throw(err);
 
          break;

          default:

            // Get the response text as Json if present (otherwise, just use the error's own message)
            res = err.responseText ? 
              json.fromJson(err.responseText) : 
              { message: err.message };
          
            // Cancel the submit button
            button ? button.cancel() : null;

            // Show the error at application level
            gw.appAlertBar.set('message', 'Application error: ' + res.message);
            gw.appAlertBar.show(5000);

            // Rethrow
            throw(err);
          break;

        }
        throw(err);

      }
    }

  };


  return r;
});


