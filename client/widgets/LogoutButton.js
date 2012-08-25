define([
  "dojo/_base/declare",
  "dojo/_base/json",

  "dijit/form/Form",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/form/Button",

  "app/lib/defaultSubmit",
  "app/lib/globals",
  "app/lib/stores",
  "app/lib/Logger",

  "app/widgets/BusyButton",

   ], function(
     declare
     , json

     , Form
     , _WidgetBase
     , _TemplatedMixin
     , _WidgetsInTemplateMixin
     , Button

     , ds
     , g
     , stores
     , Logger

     , BusyButton
 ){
    // Create the "login" pane, based on a normal ContentPane
    return declare('app.LogoutButton', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin ], {

      widgetsInTemplate: true,

      templateString: '' +
        '<span>' +
        '  <div data-dojo-type="app.AlertBar" data-dojo-attach-point="alertBar"></div>' +
        '  <form data-dojo-type="dijit.form.Form" data-dojo-attach-point="form" method="POST"> ' +
        '    <input type="submit" data-dojo-attach-point="button" data-dojo-type="app.BusyButton" label="Logout" />' +
        '  </form>' +
        '</span>',


      postCreate: function(){
        var that = this;

        // SUbmit form
        this.form.onSubmit = ds.defaultSubmit(this.form, this.button, function(){

          // Try saving it...
          stores.logoutAnon.put({}).then(
            ds.UIMsg('ok', that.form, that.button, null, true),
            ds.UIMsg('error', that.form, that.button, null, true )
          ).then(
            // This is the only spot where things _actually_ went OK... So the callback will get called
            function(res){
              Logger("Jsonrest put(data) returned OK: " + json.toJson(res) );
              that.button.cancel();
              window.location = '/login/' + workspaceNameValue;
            }
          ); // stores.workspacesAnon.put(data).then
          
        }); // this.form.onSubmit


      }, // postCreate


   });

});

