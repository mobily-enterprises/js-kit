/*
 function CHANGE(d, cb){
    G2 = d;
    d.three = 3;
    d = {};
    G3 = d;
    console.log("d was changed into:");
    console.log(d);
    cb();
  }

  var d = { one: 1, two: 2 };
  G1 = d;
  CHANGE(d, function(){
    console.log("d after the callback is: ");
    console.log(d);
  });
*/


 function CHANGE( o ){
    o.three = 3;
    o = {};
  }

  var d = { one: 1, two: 2 };
  CHANGE(d);
  console.log("d after the function is: ");
  console.log(d);

