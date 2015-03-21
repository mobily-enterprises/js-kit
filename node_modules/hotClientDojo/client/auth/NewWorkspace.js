define([

  "dojo/_base/declare"

, "dijit/layout/ContentPane"
, "dijit/form/Form"
, "dijit/form/TextBox"
, "dijit/_WidgetBase"
, "dijit/_TemplatedMixin"
, "dijit/_WidgetsInTemplateMixin"

, "hotplate/hotClientDojo/submit/defaultSubmit"
, "hotplate/hotClientDojo/stores/stores"
, "hotplate/hotClientDojo/widgets/AlertBar"
, "hotplate/hotClientDojo/widgets/BusyButton"
, "hotplate/hotClientDojo/auth/ValidationWorkspace"
, "dojo/text!hotplate/hotClientDojo/auth/templates/NewWorkspace.html"

, "hotplate/hotClientDojo/auth/ValidationWorkspace"

, "hotplate/hotClientDojo/widgets/_TemplatedHooksMixin"

], function(

  declare

, ContentPane
, Form
, TextBox
, _WidgetBase
, _TemplatedMixin
, _WidgetsInTemplateMixin

, ds
, stores
, AlertBar
, BusyButton
, ValidationWorkspace
, templateString

, ValidationWorkspace

, _TemplatedHooksMixin

){

  return declare( [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _TemplatedHooksMixin ], {

    widgetsInTemplate: true,

    templateString: templateString,
      
    postCreate: function(){
      var self = this;

      this.inherited( arguments );

      this.formWidget.onSubmit = ds.defaultSubmit(this.formWidget, this.buttonWidget, function(){
        var data = self.formWidget.getValues();

        //stores('workspaces', {} ).noCache.put( data ).then(
        stores('workspaces', {} ).put( data ).then(
          ds.UIMsg( self.buttonWidget, self.alertBarWidget , "Workspace created!" ),
          ds.UIErrorMsg( self.formWidget, self.buttonWidget, self.alertBarWidget, true )
        ).then(
          function(res){
            window.location = vars.hotCoreMultiHome.multiHomeURL.replace( ':workspaceId', res.id );
          }
        );
      });
    },

  });
});

