
define([
  "dojo/_base/declare",

  "dijit/layout/StackContainer",

  "hotplate/baseWidgets/_StackFadingMixin",

   ], function(
     declare
     , StackContainer
     , _StackFadingMixin
 ){

    return declare('baseWidgets.StackFading', [ StackContainer, _StackFadingMixin ] , { } );
 });




