
define([
  "dojo/_base/declare",

  "dijit/layout/StackContainer",

  "app/widgets/_StackFadingMixin",

   ], function(
     declare
     , StackContainer
     , _StackFadingMixin
 ){

    return declare('app.StackFading', [ StackContainer, _StackFadingMixin ] , { } );
 });




