define([
  "dojo/_base/declare",
  "dojo/_base/json",

  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/form/Form",

  "app/lib/globals",
  "app/lib/globalWidgets",
  "app/lib/defaultSubmit",
  "app/lib/Logger",
  "app/lib/stores",

  "app/widgets/AlertBar",
  "app/widgets/BusyButton",
  "app/widgets/ValidationWorkspace",
  "app/widgets/ValidationUsername",

   ], function(
     declare
     , json

     , _WidgetBase
     , _TemplatedMixin
     , _WidgetsInTemplateMixin
     , Form

     , g
     , gw
     , ds
     , Logger
     , stores

     , AlertBar
     , BusyButton
     , ValidationWorkspace
     , ValidationUsername
 ){
    // Create the "login" pane, based on a normal ContentPane
    return declare('app.Dashboard', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin ], {


      widgetsInTemplate: true,

      templateString: '' +
        '<div>' +
        '  <div data-dojo-type="app.AlertBar" data-dojo-attach-point="alertBar"></div>' +
        '  <form data-dojo-type="dijit.form.Form" data-dojo-attach-point="form" method="POST"> ' +
        '    <input id="${id}_user" data-dojo-type="app.ValidationUsername" name="login" data-dojo-props="ajaxInvalidMessage:\'User not found!\'" />' +
        '    <input type="submit" data-dojo-attach-point="button" data-dojo-type="app.BusyButton" label="Create!" />' +
        '  </form>' +
        '</div>',


      postCreate: function(){
        var that = this;

        // SUbmit form
        this.form.onSubmit = ds.defaultSubmit(this.form, this.button, function(){

          stores.roles.query({} ).then(
            ds.UIMsg('ok', that.form, that.button, that.alertBar ),
            ds.UIMsg('error', that.form, that.button, that.alertBar )
          ).then(
            function(res){
              console.log("Returned: ");
              console.log(res);
            },
            function(err){
              console.log("Error:");
              console.log(err);
            }
          );




          // Store the data 
          data = that.form.getValues();

          // YOU ARE HERE: Strange, once it fails from the server side, validation stops working for scope
          // problems

          /*

          // Try saving it...
          stores.workspacesUser.put(data).then(
            ds.UIMsg('ok', that.form, that.button, that.alertBar ),
            ds.UIMsg('error', that.form, that.button, that.alertBar )
          ).then(
            // This is the only spot where things _actually_ went OK... So the callback will get called
            function(res){
              Logger("Jsonrest put(data) returned OK: " + json.toJson(res) );
              that.button.cancel();
            }
          ); // stores.workspacesAnon.put(data).then
          
          */

        }); // this.form.onSubmit


      }, // postCreate


   });

});


