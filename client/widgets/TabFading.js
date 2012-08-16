
define([
  "dojo/_base/declare",

  "dijit/layout/TabContainer",

  "app/widgets/_StackFadingMixin",

   ], function(
     declare
     , TabContainer
     , _StackFadingMixin
 ){

    return declare('app.TabFading', [ TabContainer, _StackFadingMixin ] , { } );
 });




