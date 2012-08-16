
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/json",
  "dojo/_base/fx",
  "dojo/text!app/widgets/templates/LoginForm.html",

  "dijit/form/Form",
  "dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/layout/TabContainer",
  "dijit/layout/StackContainer",
  "dijit/layout/ContentPane",
  "dijit/layout/BorderContainer",
  "dijit/form/Button",

  "app/lib/globals",
  "app/lib/defaultSubmit",
  "app/lib/stores",
  "app/lib/Logger",

  "app/widgets/ValidationPassword",
  "app/widgets/ValidationEmail",
  "app/widgets/AlertBar",
  "app/widgets/StackFading",
  "app/widgets/TabFading",
  "app/widgets/BusyButton",


   ], function(
     declare
     , lang
     , json
     , baseFx
     , templateString

     , Form
     , _WidgetBase
     , _TemplatedMixin
     , _WidgetsInTemplateMixin
     , TabContainer
     , StackContainer
     , ContentPane
     , BorderContainer
     , Button

     , g
     , ds
     , stores
     , Logger

     , ValidationPassword
     , ValidationEmail
     , AlertBar
     , StackFading
     , TabFading
     , BusyButton
 ){
    // Create the "login" pane, based on a normal ContentPane
    return declare('app.LoginForm', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin ], {

      widgetsInTemplate: true,

      templateString:  templateString,

      // Hooks to switch tabs when clicking
      _onLoginClick: function(e){
        this.tabContainer.selectChild(this.loginPane);
      },

      _onRecoverClick: function(e){
        this.tabContainer.selectChild(this.recoverPane);
      },

      postCreate: function(){
        var that = this;
        THIS = this;

        // Don't ACTUALLY submit the form
        this.recoverForm.onSubmit = ds.defaultSubmit(this.recoverForm, this.recoverButton, function(){

          // Get the form values
          var data = that.recoverForm.getValues();

          // Submit the info
          stores.recoverAnon.put(data).then(
				  	ds.UIMsg('ok', that.recoverForm, that.recoverButton, that.recoverAlertBar),
            ds.UIMsg('error', that.recoverForm, that.recoverButton, that.recoverAlertBar)
          ).then(
            function(res){

              // Show the alertbar's message that everything is OK
              that.recoverAlertBar.set('message', "Recovery email sent!");
              that.recoverAlertBar.show(3000);

              // Reset the form and button
              that.recoverForm.reset();
              that.recoverButton.cancel();
            }

          ); // stores.recoverAnon.put(data)


        }); // this.recoverForm.onSUbmit


        // Submit function
        this.loginForm.onSubmit = ds.defaultSubmit(this.loginForm, this.loginButton, function(){

          // Get the form's values
          var data = that.loginForm.getValues();

          // Store the data 
          stores.loginAnon.put(data).then(
            ds.UIMsg('ok', that.loginForm, that.loginButton, that.loginAlertBar ),
            ds.UIMsg('error', that.loginForm, that.loginButton, that.loginAlertBar )
          ).then(
            function(res){
              Logger("Jsonrest put(data) returned OK: " + json.toJson(res) );
              that.loginButton.cancel(); 
            }
          );  // stores.loginanon.put(data)
 
        }); // this.loginform.onSubmit

     }, // postcreate

  });

});



