var 
  dummy
;

var declare = exports.declare = function(superCtor, protoMixin) {

  var ctor = function(){};

  superCtor = superCtor === null ? function(){} : superCtor;

  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  
  for( var k in protoMixin ){
    ctor.prototype[ k ] = protoMixin[ k ];
  }

  return ctor;

};


exports = module.exports = declare;

