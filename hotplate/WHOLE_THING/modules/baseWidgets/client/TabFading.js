
define([
  "dojo/_base/declare",

  "dijit/layout/TabContainer",

  "hotplate/baseWidgets/_StackFadingMixin",

   ], function(
     declare
     , TabContainer
     , _StackFadingMixin
 ){

    return declare('baseWidgets.TabFading', [ TabContainer, _StackFadingMixin ] , { } );
 });




