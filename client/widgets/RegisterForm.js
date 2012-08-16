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
  "app/lib/Logger",

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
     , Logger

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
              Logger("Jsonrest put(data) returned OK: " + json.toJson(res) );
              that.button.cancel();
            }
          ); // stores.workspacesAnon.put(data).then
          
        }); // this.form.onSubmit


      }, // postCreate


   });

});

