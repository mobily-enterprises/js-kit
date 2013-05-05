define([
  "dojo/_base/declare",
  "dojo/_base/json",
  "dojo/topic",

  "dijit/form/Form",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/form/Button",

  "hotplate/hotDojoSubmit/defaultSubmit",
  "hotplate/hotDojoStores/stores",
  "hotplate/hotDojoLogger/logger",

  "hotplate/hotDojoWidgets/BusyButton",

   ], function(
     declare
     , json
     , topic

     , Form
     , _WidgetBase
     , _TemplatedMixin
     , _WidgetsInTemplateMixin
     , Button

     , ds
     , stores
     , Logger

     , BusyButton
 ){
    // Create the "login" pane, based on a normal ContentPane
    return declare('hotplate/hotDojoAuth/LogoutButton', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin ], {

      workspaceName: '',

      widgetsInTemplate: true,

      templateString: '' +
        '<span>' +
        '  <form data-dojo-type="dijit.form.Form" data-dojo-attach-point="form" method="POST"> ' +
        '    <input type="submit" data-dojo-attach-point="button" data-dojo-type="hotplate.hotDojoWidgets.BusyButton" label="Logout" />' +
        '  </form>' +
        '</span>',

      postCreate: function(){
        var that = this;

        // SUbmit form
        this.form.onSubmit = ds.defaultSubmit(this.form, this.button, function(){

          topic.publish('hotplate/hotDojoAuth/beforeLogout');         

          // Try saving it...
          stores('logoutUser').get('').then(
            ds.UIMsg( that.button ),
            ds.UIErrorMsg( that.form, that.button, null, true )
          ).then(
            // This is the only spot where things _actually_ went OK... So the callback will get called
            function(res){
              Logger("Jsonrest put(data) returned OK: " + json.toJson(res) );
              that.button.cancel();
              window.location = '/pages/login/' + that.workspaceName;
            }
          ); // stores('logoutUser').get('').then
          
        }); // this.form.onSubmit


      }, // postCreate


   });

});

