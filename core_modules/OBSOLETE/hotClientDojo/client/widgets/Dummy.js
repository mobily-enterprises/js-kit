define( [

  "dojo/_base/declare"

, "dijit/_WidgetBase"
, "dijit/_TemplatedMixin"

], function(

  declare

, _WidgetBase
, _TemplatedMixin
){

  // This is an empty widget with resize. This is enough to prevent _ContentPaneResizeMixin to
  // decide, through this._checkIfSingleChild();, that the child widget is a single child.
  // So, adding this widget will prevent sizing of the child to the full size of the parent
  return declare( [ _WidgetBase ], {
  
    resize: function(){
    
    }
  })
});


