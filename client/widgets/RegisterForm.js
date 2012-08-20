define([
  "dojo/_base/declare",
  "dojo/on",
  "dojo/_base/lang",
  "dojo/_base/xhr",
  "dojo/_base/json",
  "dojo/aspect",
  "dojo/query",
  "dojo/text!./templates/RegisterForm.html",

  "dijit/layout/StackContainer",
  "dijit/layout/ContentPane",
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
     , templateString

     , StackContainer
     , ContentPane
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

      templateString: templateString,

      postCreate: function(){
        var that = this;

        // Select the right container for the job, depending of whether the
        // user is already logged in or not
        this.container.selectChild( loginValue ? this.registerAsUser : this.registerAsAnon );
            

        // Setting password2 so that it must match password1. I cannot do this within the
        // template as I cannot think of a way to write it in the definition
        //this.password1.mustMatch = this.password0;

        // SUbmit form
        this.formAsAnon.onSubmit = ds.defaultSubmit(this.formAsAnon, this.buttonAsAnon, function(){

          // Store the data 
          var data = that.formAsAnon.getValues();

          // Try saving it...
          stores.workspacesAnon.put(data).then(
            ds.UIMsg('ok', that.formAsAnon, that.buttonAsAnon, that.alertBarAsAnon , true ),
            ds.UIMsg('error', that.formAsAnon, that.buttonAsAnon, that.alertBarAsAnon, true )
          ).then(
            // This is the only spot where things _actually_ went OK... So the callback will get called
            function(res){
              Logger("Jsonrest put(data) returned OK: " + json.toJson(res) );
              that.buttonAsAnon.cancel();
            }
          ); // stores.workspacesAnon.put(data).then
          
        }); // this.formAsAnon.onSubmit

        this.formAsUser.onSubmit = ds.defaultSubmit(this.formAsUser, this.buttonAsUser, function(){
          var data = that.formAsUser.getValues();

          stores.workspaces.put(data).then(
            ds.UIMsg('ok', that.formAsUser, that.buttonAsUser, that.alertBarAsUser , true ),
            ds.UIMsg('error', that.formAsUser, that.buttonAsUser, that.alertBarAsUser, true )
          ).then(
             function(res){
              Logger("Jsonrest put(data) returned OK: " + json.toJson(res) );
            },
             function(err){
               if( err.status == 403 ){
                 Logger("User is no longer logged in, redirecting to normal register form");
                 that.container.selectChild( that.registerAsAnon );
               }
             }
          );

 
        });


      }, // postCreate


   });

});

