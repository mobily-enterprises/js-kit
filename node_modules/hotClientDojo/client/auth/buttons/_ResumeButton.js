define([

  "dojo/_base/declare"

, "./_Button"

], function(

  declare

, _Button

){

  return declare( [ _Button ], {

    userStrategyData: null,

    constructor: function( params ){
      var self = this;

      //  Create attributes that are local to the object
      self.userStrategyData = params.userStrategyData;
    },
  });
});





