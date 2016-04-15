define( [
   "dojo/_base/declare"

,  "dijit/_WidgetBase"
,  "dijit/_TemplatedMixin"
,  "dijit/_WidgetsInTemplateMixin"
,  "dijit/Destroyable"
,  'dijit/_Container'
,  'dijit/layout/_ContentPaneResizeMixin'
//,  'dijit/layout/ContentPane'


], function(

  declare

, _WidgetBase
, _TemplatedMixin
, _WidgetsInTemplateMixin
, Destroyable
, _Container
, _ContentPaneResizeMixin
//, ContentPane

){
  var widgets = {};

  widgets.DestroyableTemplatedContainer = declare( [ _WidgetBase, _Container, _ContentPaneResizeMixin, Destroyable, _TemplatedMixin, _WidgetsInTemplateMixin ], {
    widgetsInTemplate: true,
  });

  return widgets;

});
