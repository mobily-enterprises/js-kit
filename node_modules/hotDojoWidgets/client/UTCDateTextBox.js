define([

  "dojo/_base/declare"
, "dojo/date/stamp"
, "dijit/form/DateTextBox"

], function(
  declare
, stamp
, DateTextBox

){
  return declare( [ DateTextBox ],{

    _getValueAttr: function(){

      var ov = this.inherited(arguments);
      //console.log("GET Value before", ov );
      if( ov ){
        ov.setTime( ov.getTime() - ov.getTimezoneOffset() * 60 * 1000 );
      }
      //console.log("GET Value after:", ov );
      return ov;
    },

    _setValueAttr: function( value, priorityChange, formattedValue){

      //console.log("SET ISO value:", value );
      var v = stamp.fromISOString( value );
      //console.log("SET Value before:", v );
      if( v ){
        v.setTime( v.getTime() + v.getTimezoneOffset() * 60 * 1000 );
        value = v;
      }
      //console.log("SET Value after:", v );

      this.inherited(arguments);
    },

  });
});

