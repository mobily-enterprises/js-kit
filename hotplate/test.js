var async = require('async');



var oneWrap = function( done ){
  

}

var one = function( done ){
  console.log("1");
  console.log(arguments[1]);
  done(null, 'one', 'ONE RETURN STUFF');
}

var two = function( done ){
  console.log("2");
  done(null, 'two');
}

functionList = [
  one,
  two
];


async.series( functionList, function( err, results){
  console.log("Finished!"); 
	console.log( err ); 
  console.log( results ); 
});
