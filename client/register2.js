require([
  "dojo/_base/declare",
  "dojo/on",
  "dojo/_base/lang",
  "dojo/_base/xhr",
  "dojo/_base/json",
  "dojo/aspect",
  "dojo/query",

  "dijit/form/Form",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/form/Button",
  "dijit/form/ValidationTextBox",
  "dijit/registry",
  "dijit/Tooltip",
  "dijit/form/Button",



   ], function(
     declare
     , on
     , lang
     , xhr
     , json
     , aspect
     , query

     , Form
     , _WidgetBase
     , _TemplatedMixin
     , _WidgetsInTemplateMixin
     , Button
     , ValidationTextBox
     , registry
     , Tooltip
     , BusyButton


 ){



  // This used to be in an external module. Placing it here by wrapping it in an anonymous function
  var ds = (function(){

  var r = {}

  r.defaultSubmit = function(form, button, callback){

    return function(e){

      // Prevent the default
      e.preventDefault();

      // Make the button busy

      // Validate the form
      form.validate();
      if(! form.isValid() ){
      } else {

        // Call the callback
        callback();

        // Prevent form submission (it will be submitted through Ajax)
        return false;
      }

    }
  }


  // Function to show error messages on JsonRest put() and post() calls
  //
  r.UIMsg = function( form, button, alertBar, noLogin ){



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
    
              if( error.field != ''){

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
                          return originalValidator(value);
                          // return originalValidator.call(this, value);
                        }
                      };
                    });

 
                  } 
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

          break;   

        }

      }

  };


  return r;
  })();






    var RegisterForm = declare('app.RegisterForm', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin ], {

      widgetsInTemplate: true,

      templateString: '' +
        '<div>' +
        '  <form style="height:100%" data-dojo-type="dijit.form.Form" data-dojo-attach-point="form" method="POST"> ' +
        '    <label for="${id}_workspace">Workspace name</label>  ' +
        '    <input name="workspace" id="${id}_workspace" data-dojo-attach-point="workspace" data-dojo-type="app.ValidationWorkspace" />' + 
        '    <input type="submit" data-dojo-attach-point="button" data-dojo-type="dijit.form.Button" label="Create!" />' +
        '  </form>' +
        '</div>',


      postCreate: function(){
        var that = this;

        THIS = this;

        // Setting password2 so that it must match password1. I cannot do this within the
        // template as I cannot think of a way to write it in the definition
        //this.password1.mustMatch = this.password0;

        // SUbmit form
        this.form.onSubmit = ds.defaultSubmit(this.form, this.button, function(){

          fakeError = new Error();
          fakeError.status = 422;
          fakeError.responseText =  '[{ "field": "workspace", "message": "Workspace taken, sorry!", "mustChange": true}]';
          ds.UIMsg( that.form, that.button, null, true )(fakeError)

          console.log("Submitted!");

        }); // this.form.onSubmit


      }, // postCreate

   });



  
    var ValidationWorkspace =  declare('app.ValidationWorkspace', [ ValidationTextBox] ,  {

      validator: function(value){

        // Run the normal field validators -- if they fail,
        // return false
        var validation = {result: true}; 
        if( ! validation.result ){
          this.invalidMessage = validation.message;
          return false;
        }

        // 
        return this.ajaxValidate(value, {
           ajaxInvalidMessage: "Workspace taken",
           ajaxStore: null,
           ajaxFilterField: 'name',
        });

      },

      constructor: function(){

        // Declaring object variable in constructor to make sure that
        // they are not class-wide (since they will be in the prototype)
        this.ajaxSaidNo = {};
        this.ajaxSaidYes = {};
        this.ajaxRequested = {};
      },

      // Overloads the validator, adding extra stuff
      ajaxValidate: function(value, options){
        console.log("ajaxValidate CALLED!");
        return true;
      },

      invalidMessage: "Workspace name not valid",
      missingMessage: "Workspace name cannot be empty",

    });


  myobject = { value: 10 };
  myobject.testing = function(){
    console.log("This is: ");
    console.log(this);
    console.log("Value: " + this.value);
    console.log('');
  }
  myobject.testing();
  aspect.around(myobject,'testing', function(originalTesting){
    return function(){
      console.log("Before");
      originalTesting.();
      console.log("After");
    }
  });
  myobject.testing();


  // Create the "application" object, and places them in the right spot.
  registerForm = new RegisterForm( {} , 'registerForm');
  registerForm.startup();

});


