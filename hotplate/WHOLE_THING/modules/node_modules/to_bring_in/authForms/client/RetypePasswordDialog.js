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

  "hotplate/hotplate/Logger",
  "app/lib/stores",
  "hotplate/baseProtocol/main",

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

  , Logger
  , stores
  , protocol

  , ValidationPassword
  , AlertBar
  , BusyButton

  ){

  var r = {}


  r.RetypePasswordDialog = declare("authForms.RetypePasswordDialog", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

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
          r.UIMsg('ok', that.form, that.button, that.alertBar, true ),
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
              window.location="/pages/login";
            }
          }
        );  // stores.loginanon.put(data)
        return false;
      });
    }
  });
  r.RetypePasswordDialog.failureCounts = 0;

  r.retypePasswordDialog = r.RetypePasswordDialog();

