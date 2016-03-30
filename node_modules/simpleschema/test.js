"use strict";
/*
Copyright (C) 2013 Tony Mobily

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var 
  dummy

, declare = require('simpledeclare')
, Schema = require('./SimpleSchema.js')
;


// Make sure uncaught errors are displayed
process.on('uncaughtException', function(err) {
  console.error(err.stack);
});


function l( v ){
  console.log( require( 'util' ).inspect( v, { depth: 10 } ) );
}


// Basic schemas reused throughout the tests

var simpleSchema = new Schema({
  name:    { type: 'string', required: true },
  surname: { type: 'string', required: true  },
  age:     { type: 'number' },
});


var complexSchema = new Schema({
  name:    { type: 'string', default: 'SOMETHING', uppercase: true, trim: 30, notEmpty: true },
  surname: { type: 'string', max: 20, lowercase: true, required: true },
  age:     { type: 'number', default: 15, min: 10, max: 40, validator: function( obj, value, fieldName ){ if( value == 11 ) return 'Age cannot be 11'; return; } },
  id:      { type: 'id' },
  date:    { type: 'date' },
  list:    { type: 'array' },
  various: { type: 'serialize', required: false },
},
{
  // Validation function called by schema.validate() for async validation
  validator: function( object, originalObject, castObject, options, done ){
    var errors = [];

    if( object.name == 'Sam' ){
       errors.push( { field: 'name', message: 'Sam is not an acceptable name' } );
    }
    done( null, errors );
  }
});



var tests = {

  "casting": function( test ){
    var self = this;

    var p1 = {
      name: 121212,
      surname: 343434,
      age: '19'
    };

    complexSchema.validate( p1, function( err, newP6, errors ){
      test.ifError( err );
      test.deepEqual( errors, [] );
      test.deepEqual( newP6, { name: '121212', surname: '343434', age: 19 } );
      test.done();
    });
  },


  "required fields": function( test ){
    var self = this;

    var p1 = {
      name: 'Tony',
      age: 37
    }; 
    simpleSchema.validate( p1, function( err, newP1, errors ){
      test.ifError( err );
      test.deepEqual( newP1, { name: 'Tony', age: 37 } );
      test.deepEqual( errors, [ { field: 'surname', message: 'Field required: surname' } ] );

      var p2 = {
        age: 37
      }; 
      simpleSchema.validate( p2, function( err, newP2, errors ){
        test.ifError( err );
        test.deepEqual( newP2, { age: 37 } );
        test.deepEqual( errors, [ { field: 'name', message: 'Field required: name' },  { field: 'surname', message: 'Field required: surname' } ] );
        test.done();
      });
    });

  },


  "params on strings": function( test ){
    var self = this;

    var p1 = {
      name: 'ToNy',
      surname: 'MOBILY',
    };

    complexSchema.validate( p1, function( err, newP1, errors ){
      test.ifError( err );
      test.deepEqual( errors, [] );
      test.deepEqual( newP1, { name: 'TONY', surname: 'mobily', age: 15 } );
      
      var p2 = {
        surname: 'MOBILY',
      };

      complexSchema.validate( p2, function( err, newP2, errors ){
        test.ifError( err );
        test.deepEqual( errors, [] );
        test.deepEqual( newP2, { name: 'SOMETHING', surname: 'mobily', age: 15 } );

        var p3 = {
          name: 'A very long name that will be truncated at the thirty characters limit',
          surname: 'MOBILY',
        };

        complexSchema.validate( p3, function( err, newP3, errors ){
          test.ifError( err );
          test.deepEqual( errors, [] );
          test.deepEqual( newP3, { name: 'A VERY LONG NAME THAT WILL BE ', surname: 'mobily', age: 15 } );

          var p4 = {
            name: '',
            surname: 'MOBILY',
          };

          complexSchema.validate( p4, function( err, newP4, errors ){
            test.ifError( err );
            test.deepEqual( errors, [ { field: 'name', message: 'Field cannot be empty: name' } ] );
            test.deepEqual( newP4, { name: '', surname: 'mobily', age: 15 } );

            var p5 = {
              name: 'tony',
              surname: 'THIS SURNAME IS WAY TOO LONG AND WILL FAIL VALIDATION',
            };

            complexSchema.validate( p5, function( err, newP5, errors ){
              test.ifError( err );
              test.deepEqual( errors, [ { field: 'surname', message: 'Field is too long: surname' } ] );
              test.deepEqual( newP5, { name: 'TONY', surname: 'THIS SURNAME IS WAY TOO LONG AND WILL FAIL VALIDATION', age: 15 } );

              test.done();
            });
          });
        });
      });
    });
  },


  "params on numbers": function( test ){
    var self = this;

    //age:     { type: 'number', default: 15, min: 10, max: 40, validator: function( obj, value, fieldName ){ if( value == 0 ) return 'Age cannot be 11'; return; } },

    var self = this;

    var p1 = {
      surname: 'MOBILY',
    };

    complexSchema.validate( p1, function( err, newP1, errors ){
      test.ifError( err );
      test.deepEqual( errors, [] );
      test.deepEqual( newP1, { name: 'SOMETHING', surname: 'mobily', age: 15 } );
     
      var p2 = {
        surname: 'MOBILY',
        age: 9
      };

      complexSchema.validate( p2, function( err, newP2, errors ){
        test.ifError( err );
        test.deepEqual( errors, [ { field: 'age', message: 'Field is too low: age' } ] );
        test.deepEqual( newP2, { name: 'SOMETHING', surname: 'mobily', age: 9 } );

        var p3 = {
          surname: 'MOBILY',
          age: 10
        };

        complexSchema.validate( p3, function( err, newP3, errors ){
          test.ifError( err );
          test.deepEqual( errors, [] );
          test.deepEqual( newP3, { name: 'SOMETHING', surname: 'mobily', age: 10 } );

          var p4 = {
            surname: 'MOBILY',
            age: 41,
          };

          complexSchema.validate( p4, function( err, newP4, errors ){
            test.ifError( err );
            test.deepEqual( errors, [ { field: 'age', message: 'Field is too high: age' } ] );
            test.deepEqual( newP4, { name: 'SOMETHING', surname: 'mobily', age: 41 } );

            var p5 = {
              surname: 'MOBILY',
              age: 11
            };

            complexSchema.validate( p5, function( err, newP5, errors ){
              test.ifError( err );
              test.deepEqual( errors, [ { field: 'age', message: 'Age cannot be 11' } ] );
              test.deepEqual( newP5, { name: 'SOMETHING', surname: 'mobily', age: 11 } );

              test.done();
            });
          });
        });
      });
    });




  },

  "skipXXX parameters": function( test ){
    var self = this;

    var p1 = {
      surname: 'MOBILY',
      age: 45 
    };

    complexSchema.validate( p1, { skipParams: { age: [ 'max' ] } },  function( err, newP1, errors ){
      test.ifError( err );
      test.deepEqual( errors, [] );
      test.deepEqual( newP1, { name: 'SOMETHING', surname: 'mobily', age: 45 } );

      var p1 = {
        surname: 'MOBILY',
        age: 13 
      };

      complexSchema.validate( p1, { skipCast: [ 'age' ] },  function( err, newP1, errors ){
        test.ifError( err );
        test.deepEqual( errors, [] );
        test.deepEqual( newP1, { name: 'SOMETHING', surname: 'mobily', age: '13' } );

        test.done();
      });
    });

  },

  "onlyObjectValue parameter": function( test ){
    var self = this;

    var p1 = {
      age: '13' 
    };

    complexSchema.validate( p1, { onlyObjectValues: true },  function( err, newP1, errors ){
      test.ifError( err );
      test.deepEqual( errors, [] );
      test.deepEqual( newP1, { age: 13 } );

     test.done();
    });
  },

  "serialization (inc. deserialize parameter)": function( test ){
    var self = this;

     var p1 = {
      various: { a: 10, b: 20, c: { c1: 20, c2: 30 } }
    };

    var p2 = {
      various: '{"a":10,"b":20,"c":{"c1":20,"c2":30}}'
    };


    complexSchema.validate( p1, { onlyObjectValues: true },  function( err, newP1, errors ){
      test.ifError( err );
      test.deepEqual( errors, [] );
      test.deepEqual( newP1, { various: p2.various } );

      complexSchema.validate( p1, { onlyObjectValues: true, deserialize: true },  function( err, newP1, errors ){
        test.ifError( err );
        test.deepEqual( errors, [ { field: 'various', message: 'Error during casting' } ] );
        test.deepEqual( newP1, p1 );

        complexSchema.validate( p2, { onlyObjectValues: true },  function( err, newP2, errors ){
          test.ifError( err );
          test.deepEqual( errors, [ { field: 'various', message: 'Error during casting' } ] );
          test.deepEqual( newP2, p2 );

          complexSchema.validate( p2, { onlyObjectValues: true, deserialize: true },  function( err, newP2, errors ){
            test.ifError( err );
            test.deepEqual( errors, [] );
            test.deepEqual( newP1, { various: p1.various } );
            test.done();
          });
        });
      });
    });
  },


  "async validation": function( test ){
    var self = this;

    var p1 = {
      name: 'Sam',
      age: 11 
    }; 

    complexSchema.validate( p1, function( err, newP1, errors ){
      test.ifError( err );
      test.deepEqual( newP1, { name: 'SAM', age: 11 } );
      test.deepEqual( errors, [ { field: 'surname', message: 'Field required: surname' }, { field: 'age', message: 'Age cannot be 11' } ]  );

      test.done();
    });

  },

  "cleanup": function( test ){
    var self = this;

    var p1 = {
      name: 'Tam',
      surname: 'Mobily',
      age: 12 
    }; 

    complexSchema.validate( p1, function( err, newP1, errors ){
      test.ifError( err );
      test.deepEqual( newP1, { name: 'TAM', surname: 'mobily', age: 12 } );
      test.deepEqual( errors, [ ] );

      complexSchema.cleanup( newP1, 'lowercase' );
      test.deepEqual( newP1, { name: 'TAM', age: 12 } );

      test.done();
    });

  },

  "makeId() (class and object)": function( test ){
    var self = this;

    var p1 = {
      name: 'Tam',
      surname: 'Mobily',
      age: 12 
    }; 

    complexSchema.makeId( p1, function( err, id ){
      test.ifError( err );
      test.ok( id !== null && id != '' );

      Schema.makeId( p1, function( err, id ){
        test.ifError( err );
        test.ok( id !== null && id != '' );

        test.done();
      });
    });
  },
};
  
// Copy tests over to exports
for( var i in tests ){
  exports[ i ] = tests[ i ];
}



