define( [], function(){

  var e = {};

  e.escapeHTML = function( str ) {
    var div  = document.createElement( 'div' );
    var text = document.createTextNode( str );
    div.appendChild( text );
    return div.innerHTML;
  };

  return e;
});
