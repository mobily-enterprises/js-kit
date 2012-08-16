define([
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

  "app/lib/defaultSubmit",
  "app/lib/globals",
  "app/lib/stores",

  "app/widgets/ValidationWorkspace",
  "app/widgets/ValidationUsername",
  "app/widgets/ValidationPassword",
  "app/widgets/ValidationEmail",
  "app/widgets/AlertBar",
  "app/widgets/BusyButton",



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

     , ds
     , g
     , stores

     , ValidationWorkspace
     , ValidationUsername
     , ValidationPassword
     , ValidationEmail
     , AlertBar
     , BusyButton
 ){
    // Create the "login" pane, based on a normal ContentPane
    return declare('app.RegisterForm', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin ], {


      widgetsInTemplate: true,

      templateString: '' +
        '<div>' +
        '  <div data-dojo-type="app.AlertBar" data-dojo-attach-point="alertBar"></div>' +
        '  <form style="height:100%" data-dojo-type="dijit.form.Form" data-dojo-attach-point="form" method="POST"> ' +
        '    <label for="${id}_workspace">Workspace name</label>  ' +
        '    <input name="workspace" id="${id}_workspace" data-dojo-attach-point="workspace" data-dojo-type="app.ValidationWorkspace" />' + 
        '    <label for="${id}_email">Email</label>  ' +
        '    <input name="email" id="${id}_email" data-dojo-attach-point="email" data-dojo-type="app.ValidationEmail" />' + 
        '    <label for="${id}_login">Login</label>  ' +
        '    <input name="login" id="${id}_login" data-dojo-attach-point="login" data-dojo-type="app.ValidationUsername" />' + 
        '    <label for="${id}_password0">Password</label>  ' +
        '    <input name="password" id="${id}_password0" data-dojo-attach-point="password0" data-dojo-type="app.ValidationPassword" />' + 
        '    <label for="${id}_password1">Confirm password</label>  ' +
        '    <input name="password" id="${id}_password1" data-dojo-attach-point="password1" data-dojo-type="app.ValidationPassword" />' + 
        '    <input type="submit" data-dojo-attach-point="button" data-dojo-type="app.BusyButton" label="Create!" />' +
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

          // Store the data 
          data = that.form.getValues();

          // Try saving it...
          stores.workspacesAnon.put(data).then(
            ds.UIMsg('ok', that.form, that.button, that.alertBar ),
            ds.UIMsg('error', that.form, that.button, that.alertBar )
          ).then(
            // This is the only spot where things _actually_ went OK... So the callback will get called
            function(res){
              g.Log("Jsonrest put(data) returned OK: " + json.toJson(res) );
              that.button.cancel();
            }
          ); // stores.workspacesAnon.put(data).then
          
        }); // this.form.onSubmit


      }, // postCreate


   });

});


/* SCRAP 

// Don't ACTUALLY submit the form
        this.form.onSubmit___  = function(e){

          // Make the button busy
          that.button.makeReallyBusy();

          // Validate the form
          this.validate();
          if(! this.isValid() ){
            g.Log("Didn't validate, cancelling");
            that.button.cancel(); 
          } else {

            // res = g.formXhr( that.form, that.alertBar );
            // FIXME: Make this automatic!
            data = that.form.getValues();

            // Store the data 
            g.stores.workspacesAnon.put(data).then(
              g.UIMsg('ok', that.form, that.alertBar ),
              g.UIMsg('error', that.form, that.alertBar )
            ).then(
              function(res){
                g.Log("Jsonrest put(data) returned OK: " + json.toJson(res) );
                that.button.cancel(); 

                g.stores.workspacesAnon.query({name:'pippo'}).then(
                  function(res){
                    console.log("Result: " + res);
                  }
                );

              }
            );

            res.then(
              function(res){
                g.Log("Main program: success with: " + json.toJson(res) );
                if(res.response == 'OK'){
                  g.Log("The form worked OK");
                  // var test = g.stores.workspace.get('pp');
                } 
              }
            );
            ..
              function(err){
                g.Log("Jsonrest put(data) returned ERROR: " + json.toJson(err) );
                that.button.cancel(); 
              }

          }

*/

/* SCRAP
        // This will ensure that if the user pressed the button, AND the form
        // didn't validate, the button returns clickable (the user is still on the form)
        this.button.afterClick = lang.hitch(this, function(){
          if( ! this.form.validate() ){
            this.button.cancel();
          }
        });
        */
        
        /*
          // CHUNK: FULL FORM VALUDATION WITH EVERY CONDITION MANAGED
          // (NOT NEEDED SINCE THE POINT OF HTE INFRASTRUCTURE IS TO MANAGE
          // MOST OF THE UNEXPECTED SITUATIONS)
          if(this.isValid() ){

            res = g.formXhr( that.form );
            res.then(
              function(res){
                console.log("Main program: success with: " + res);
                if(res.response == 'OK'){
                  console.log("The form worked OK");
                } else {
                  console.log("The form had validation issues");
                }
                that.button.cancel();
              }
              , function(res){
                console.log("Main program: failed with: " + res );
                that.button.cancel();
              }
              
            );


          } else {
            console.log("Didn't validate, cancelling");
            that.button.cancel(); 
          }
        */


