define( [

  "dojo/_base/declare"
, "dijit/layout/TabContainer"
, "hotplate/hotClientDojo/widgets/_StackFadingMixin"

], function(

  declare
, TabContainer
, _StackFadingMixin

){
  return declare( [ TabContainer, _StackFadingMixin ] );
});
