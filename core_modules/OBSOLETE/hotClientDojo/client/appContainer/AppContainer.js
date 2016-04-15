define( [

  "dojo/_base/declare"

, "dijit/layout/BorderContainer"

, "hotplate/hotClientDojo/widgets/_TemplatedHooksMixin"

], function(

  declare

, BorderContainer

, _TemplatedHooksMixin

){

  return declare( [ BorderContainer, _TemplatedHooksMixin ], {
    design: 'headLine',
  });
     
});

