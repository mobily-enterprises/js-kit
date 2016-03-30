/*
Copyright (C) 2013 Tony Mobily

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/*
TEST WISHLIST:
--------------

* Instancing twice on the same table should throw
* Custom SchemaError works
* INSERT: skipValidation works
* UPDATE: skipValidation works
* cursor.each(), with break
* dirty functions (dirtyRecord( obj, cb ), dirtyAll( cb ), dirtyAllParents( cb ) )
* Positioning works 100% (use new table for it)
* Indexes (mongo-specific), table methods: makeIndex(), dropIndex, dropAllIndexes(), generateSchemaIndexes()
* Indexes (mongo-specific), class methods: generateSchemaIndexesAllLayers(),dropAllIndexesAllLayers()
* Indexes (generic): _indexGroups is created properly
* Indexes (generic): extraIndexes adds right entries to _indexGroup
* Constructor:
  * Make object that doesn't define one of 'table', 'schema', 'idProperty', 'db' should throw
  * self.idProperty should be defined in the schema
  * idProperty in the schema is AUTOMATICALLY set as required, searchable, indexOptions = { unique: true }
  * positionBase has element that is not in schema: throw
* Table hashes (after running layer._makeTablesHashes() )
  * _searchableHash is enriched with children's earchable fields, with path (lookup and multi)
  * childrenTablesHash, lookupChildrenTablesHash, multipleChildrenTablesHash, parentTablesArray are correct
* Children:
  * Update (single) addressesR: does the father get updated/deleted?
  * Update (mass) addressesR: does the father get updated/deleted?
  * Select filtering by subrecord
  * Update record: do children (single and lookup) get updated correctly?
*/

var
  dummy

, declare = require('simpledeclare')
, SimpleSchema = require('simpleschema')
, SimpleDbLayer = require('simpledblayer')
, async = require('async')
;

var db, layer;

var peopleData = exports.peopleData = [
  { name: 'Chiara',    surname: 'Mobily',     age: 22 },
  { name: 'Tony',      surname: 'Mobily',     age: 37 },
  { name: 'Sara',      surname: 'Connor',     age: 14 },
  { name: 'Daniela',   surname: 'Mobily',     age: 64 },
];

function i( v ){
  console.log( require( 'util' ).inspect( v, { depth: 10 } ) );
}

var compareItems = function( test, a, b ){

  var a1 = {}, b1 = {};

  for( var k in a ) a1[ k ] = a[ k ];
  for( var k in b ) b1[ k ] = b[ k ];

  if( a1._children ) delete a1._children;
  if( b1._children ) delete b1._children;

  return compareCollections( test, [ a1 ], [ b1 ] );
}

var compareCollections = function( test, a, b ){

  // Makes sure that records have the keys in the right order
  var a0 = [];
  for( var i = 0, l = a.length; i < l; i ++ ){
    var item = a[ i ];
    var newItem = {};
    Object.keys( item ).sort().forEach( function( k ){
      newItem[ k ] = item[ k ];
    });
    delete newItem._children;
    a0.push( newItem );
  }
  var b0 = [];
  for( var i = 0, l = b.length; i < l; i ++ ){
    var item = b[ i ];
    var newItem = {};
    Object.keys( item ).sort().forEach( function( k ){
      newItem[ k ] = item[ k ];
    });
    delete newItem._children;
    b0.push( newItem );
  }

  try {
    var a1 = [], a2, a3;
    a0.forEach( function( item ){
      a1.push( JSON.stringify( item ) );
    });
    a2 = a1.sort();
    a3 = JSON.stringify( a2 );

    var b1 = [], b2, b3;
    b0.forEach( function( item ){
      b1.push( JSON.stringify( item ) );
    });
    b2 = b1.sort();
    b3 = JSON.stringify( b2 );
  } catch ( e ){
    test.fail( a, b, "Comparison failed", "recordset comparison" );
  }

  equal = ( a3 == b3 );

  if( ! equal ){
    test.fail( a, b, "Record sets do not match", "recordset comparison" );
    //test.fail( a, b, console.log("MISMATCH BETWEEN:" );
    //console.log( a );
    //console.log( b );
    //console.log( a3 );
    //console.log( b3 );

    console.log( (new Error()).stack );
  }

  //test.ok( equal, "Record sets do not match" );

}

var populateCollection = function( data, collection, cb ){

  var functions = [];

  // Populate the database
  async.eachSeries(
    data,
    function( datum, cb ){
      collection.insert( datum, function( err ){
        if( err ) return cb( err );
        cb( null );
      })
    },
    function( err ){
      if( err ) return cb( err );
      cb( null );
    }
  );
}


var clearAndPopulateTestCollection = function( g, cb ){

  g.people.delete( { }, { multi: true }, function( err ){
    if( err ) return cb( err );

    populateCollection( peopleData, g.people, function( err ){
      if( err ) return cb( err );

      cb( null );
    });
  })
}

exports.get = function( getDbInfo, closeDb, makeExtraTests ){

  var tests;
  var g = {};

  var startup = function( test ){
    var self = this;

    process.on('uncaughtException', function(err) {
      console.error("UNCAUGHT ERROR: ", err.stack);
    });

    getDbInfo( function( err, db, SchemaMixin, DriverMixin ){
      if( err ){
        throw( new Error("Could not connect to db, aborting all tests") );
        process.exit();
      }

      // Set the important g.driver variables (db and DriverMixin)
      g.driver = {};
      g.driver.db = db;
      g.driver.DriverMixin = DriverMixin;
      g.driver.SchemaMixin = SchemaMixin; // Note: this will be ignored for now

      g.commonPeopleSchema = new g.driver.SchemaMixin( {
        name   : { type: 'string', searchable: true, sortable: true },
        surname: { type: 'string', searchable: true, sortable: true, required: true },
        age    : { type: 'number', searchable: true, sortable: true },
      });

      test.done();
    });
  }

  var finish = function( test ){
    var self = this;
    closeDb( g.driver.db, function( err ){
      if( err ){
        throw( new Error("There was a problem disconnecting to the DB") );
      }
      test.done();
    });
  };


  tests = {

    startup: startup,


    "create constructors and layers": function( test ){
      var self = this;

      try {
        g.Layer = declare( [ SimpleDbLayer, g.driver.DriverMixin ], { db: g.driver.db });

        g.people = new g.Layer( { table: 'people', schema: g.commonPeopleSchema, idProperty: 'name' } );
		  	test.ok( g.people );

      } catch( e ){
        console.log("Error: couldn't create basic test layers, aborting all tests...");
        console.log( e );
        console.log( e.stack );
        process.exit();
      }


      // Test that it works also by passing the db in the constructor
      var LayerNoDb = declare( [ SimpleDbLayer, g.driver.DriverMixin ] );
      var peopleDb = new LayerNoDb( { table: 'peopleDb', schema: g.commonPeopleSchema, idProperty: 'name', db: g.driver.db } );
      test.ok( peopleDb );
      test.ok( peopleDb.db === g.people.db );

      // Test that passing `db` will override whatever was in the prototype
      // This db will work both for miniMongo and for the real mongo
      var fakeDb = { collection: function(){ return "some" }, addCollection: function() { return "more" } };
      var peopleRewriteDb = new g.Layer( { table: 'peopleRewriteDb', schema: g.commonPeopleSchema, idProperty: 'name', db: fakeDb } );
      test.ok( fakeDb === peopleRewriteDb.db );

      // Test that not passing `db` anywhere throws
      test.throws( function(){
        new LayerNoDb( { table: 'peopleNoDb', schema: g.commonPeopleSchema, idProperty: 'name' } );
      }, undefined, "Constructing a collection without definind DB in prototype or constructions should fail");

      test.done();

    },

    "insert": function( test ){

      g.people.delete( { }, { multi: true }, function( err ){
        test.ifError( err ); if( err ) return test.done();
        var person = { name: "Joe", surname: "Mitchell", age: 48 };
        g.people.insert( person, function( err, personReturned ){
          test.ifError( err ); if( err ) return test.done();
          test.deepEqual( person, personReturned, "Mismatch between what was written onto the DB and what returned from the DB" );
          test.done();
        });
      });

    },


    "selects, equality" : function( test ){

      clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();

        g.people.select( { conditions:
          { type: 'and', args: [
            { type: 'eq', args: [ 'name', 'Tony' ] },
            { type: 'eq', args: [ 'surname', 'Mobily' ] },
            { type: 'eq', args: [ 'age', 37 ] },
          ] }
        }, function( err, results, total ){

          test.ifError( err ); if( err ) return test.done();

          var r = [ { name: 'Tony', surname: 'Mobily',  age: 37 } ];

          test.equal( total, 1 );
          compareCollections( test, results, r );

          test.done();
        })

      })
    },

    "selects, partial equality": function( test ){

        var self = this;

      clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();

        g.people.select( { conditions: { type: 'startsWith', args: [ 'surname', 'Mob' ] } }, function( err, results, total ){
          test.ifError( err ); if( err ) return test.done();

          var r = [
                    { name: 'Tony',      surname: 'Mobily',     age: 37 },
                    { name: 'Chiara',    surname: 'Mobily',     age: 22 },
                    { name: 'Daniela',   surname: 'Mobily',     age: 64 },
                  ];

          test.equal( total, 3 );
          compareCollections( test, results, r );

          g.people.select( { conditions: { type: 'endsWith', args: [ 'surname', 'nor' ] } }, function( err, results, total ){
            test.ifError( err ); if( err ) return test.done();

            var r = [
              { name: 'Sara',  surname: 'Connor', age: 14 },
            ];

            compareCollections( test, results, r );
            test.equal( total, 1 );

            g.people.select( { conditions: { type: 'contains', args: [ 'surname', 'on' ] } }, function( err, results, total ){
              test.ifError( err ); if( err ) return test.done();

              var r = [
                { name: 'Sara',  surname: 'Connor', age: 14 },
              ];

              compareCollections( test, results, r );
              test.equal( total, 1 );

              test.done();
            });
          });
        })

      })
    },

    "selects, comparisons": function( test ){

      clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();

        g.people.select( { conditions: { type: 'gt', args: [ 'name', 'M' ] } }, function( err, results, total ){
          test.ifError( err ); if( err ) return test.done();

          var r = [
            { name: 'Tony',      surname: 'Mobily',     age: 37 },
            { name: 'Sara',      surname: 'Connor',     age: 14 },
          ];

          compareCollections( test, results, r );
          test.equal( total, 2 );

          g.people.select( { conditions: { type: 'gt', args: [ 'age', 22 ] } }, function( err, results, total ){
            test.ifError( err ); if( err ) return test.done();

            var r = [
              { name: 'Tony',      surname: 'Mobily',     age: 37 },
              { name: 'Daniela',   surname: 'Mobily',     age: 64 },
            ];

            compareCollections( test, results, r );
            test.equal( total, 2 );


            g.people.select( { conditions: { type: 'gte', args: [ 'age', 22 ] } }, function( err, results, total ){
              test.ifError( err ); if( err ) return test.done();

              var r = [
                { name: 'Chiara',    surname: 'Mobily',     age: 22 },
                { name: 'Tony',      surname: 'Mobily',     age: 37 },
                { name: 'Daniela',   surname: 'Mobily',     age: 64 },
              ];

              compareCollections( test, results, r );
              test.equal( total, 3 );


              g.people.select( { conditions: { type: 'and', args: [
                { type: 'gt', args: [ 'age', 22 ] },
                { type: 'lt', args: [ 'age', 60 ] },
              ] } }, function( err, results, total ){

                var r = [
                 { name: 'Tony',      surname: 'Mobily',     age: 37 },
                ];

                compareCollections( test, results, r );
                test.equal( total, 1 );

                test.done();
              })
            })
          })

        });

      })
    },


    "selects, ranges and limits": function( test ){

       clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();
        g.people.select( { ranges: { limit: 1 } }, function( err, results, total, grandTotal ){
          test.ifError( err ); if( err ) return test.done();

          test.equal( total, 1 );
          test.equal( grandTotal, 4 );

          g.people.select( { ranges: { limit: 2 } }, function( err, results, total ){
            test.ifError( err ); if( err ) return test.done();

            test.equal( total, 2 );
            test.equal( grandTotal, 4 );

            g.people.select( { ranges: { skip: 1, limit: 3 } }, function( err, results, total ){
              test.ifError( err ); if( err ) return test.done();

              test.equal( total, 3 );
              test.equal( grandTotal, 4 );

              g.people.select( { ranges: { limit: 3 } }, function( err, results, total ){
                test.ifError( err ); if( err ) return test.done();

                test.equal( total, 3 );
                test.equal( grandTotal, 4 );

                g.people.select( { ranges: { skip: 1 } }, function( err, results, total ){
                  test.ifError( err ); if( err ) return test.done();

                  test.equal( total, 3 );;
                  test.equal( grandTotal, 4 );

                  g.people.select( { ranges: { limit: 2 } }, function( err, results, total ){
                    test.ifError( err ); if( err ) return test.done();

                    test.equal( total, 2 );
                    test.equal( grandTotal, 4 );

                    g.people.select( { ranges: { skip: 1, limit: 2 } }, function( err, results, total ){
                      test.ifError( err ); if( err ) return test.done();

                      test.equal( total, 2 );
                      test.equal( grandTotal, 4 );
                      test.done();
                    });
                  });

                });

              });

            })
          })

        });

      })

    },

    "selects, sort": function( test ){

      clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();

        g.people.select( { sort: { name: 1 } }, function( err, results, total ){
          test.ifError( err ); if( err ) return test.done();

          var r =  [
            { name: 'Chiara',    surname: 'Mobily',     age: 22 },
            { name: 'Daniela',   surname: 'Mobily',     age: 64 },
            { name: 'Sara',      surname: 'Connor',     age: 14 },
            { name: 'Tony',      surname: 'Mobily',     age: 37 },
          ];

          test.deepEqual( results, r );
          test.equal( total, 4 );


          g.people.select( { sort: { surname: 1, name: 1 } }, function( err, results, total ){
            test.ifError( err ); if( err ) return test.done();

            var r =  [
              { name: 'Sara',      surname: 'Connor',     age: 14 },
              { name: 'Chiara',    surname: 'Mobily',     age: 22 },
              { name: 'Daniela',   surname: 'Mobily',     age: 64 },
              { name: 'Tony',      surname: 'Mobily',     age: 37 },
            ];

            test.deepEqual( results, r );
            test.equal( total, 4 );

            g.people.select( { ranges: { limit: 2 },  sort: { surname: -1, age: -1 } }, function( err, results, total ){
              test.ifError( err ); if( err ) return test.done();

              var r =  [
                { name: 'Daniela',   surname: 'Mobily',     age: 64 },
                { name: 'Tony',      surname: 'Mobily',     age: 37 },
              ];

              test.deepEqual( results, r );
              test.equal( total, 2 );

              test.done();
            });

          });

        });
      })

    },

    "selects, cursor": function( test ){

      clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();

        g.people.select( { sort: { name: 1 } }, { useCursor: true }, function( err, cursor, total ){
          test.ifError( err ); if( err ) return test.done();

          test.notEqual( cursor, null );
          test.notEqual( cursor, undefined );
          test.equal( total, 4 );

          var r =  [
            { name: 'Chiara',    surname: 'Mobily',     age: 22 },
            { name: 'Daniela',   surname: 'Mobily',     age: 64 },
            { name: 'Sara',      surname: 'Connor',     age: 14 },
            { name: 'Tony',      surname: 'Mobily',     age: 37 },
          ];
          cursor.next( function( err, person ){
            test.ifError( err ); if( err ) return test.done();
            test.deepEqual( person, r[ 0 ] );

            cursor.next( function( err, person ){
              test.ifError( err ); if( err ) return test.done();
              test.deepEqual( person, r[ 1 ] );

              cursor.next( function( err, person ){
                test.ifError( err ); if( err ) return test.done();
                test.deepEqual( person, r[ 2 ] );

                cursor.next( function( err, person ){
                  test.ifError( err ); if( err ) return test.done();
                  test.deepEqual( person, r[ 3 ] );

                  cursor.next( function( err, person ){
                    test.ifError( err ); if( err ) return test.done();
                    test.deepEqual( person, null );

                    test.done();
                  });
                });
              });
            });
          });
        });
      })
    },

    "selects, cursor (using each)": function( test ){

      clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();

        g.people.select( { sort: { name: 1 } }, { useCursor: true }, function( err, cursor, total ){
          test.ifError( err ); if( err ) return test.done();

          test.notEqual( cursor, null );
          test.notEqual( cursor, undefined );
          test.equal( total, 4 );

          var r =  [
            { name: 'Chiara',    surname: 'Mobily',     age: 22 },
            { name: 'Daniela',   surname: 'Mobily',     age: 64 },
            { name: 'Sara',      surname: 'Connor',     age: 14 },
            { name: 'Tony',      surname: 'Mobily',     age: 37 },
          ];
          var e = [];

          cursor.each(
            function( item, cb ){
              e.push( item );
              cb( null );
            },
            function( err ){
            test.ifError( err ); if( err ) return test.done();
              compareCollections( test, r, e );

              test.done();
            }
          );
        });

      })
    },


    "selects, cursor (using each, interrupting it)": function( test ){

      clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();

        g.people.select( { sort: { name: 1 } }, { useCursor: true }, function( err, cursor, total ){
          test.ifError( err ); if( err ) return test.done();

          test.notEqual( cursor, null );
          test.notEqual( cursor, undefined );
          test.equal( total, 4 );

          var r =  [
            { name: 'Chiara',    surname: 'Mobily',     age: 22 },
            { name: 'Daniela',   surname: 'Mobily',     age: 64 },
          ];
          var e = [];

          cursor.each(
            function( item, cb ){
              e.push( item );
              if( item.name === 'Daniela' ) return cb( null, true );
              cb( null );
            },
            function( err ){
            test.ifError( err ); if( err ) return test.done();
              compareCollections( test, r, e );

              test.done();
            }
          );
        });

      })
    },


    "deletes": function( test ){

      clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();

        g.people.select( { },  function( err, results, total ){
          test.ifError( err ); if( err ) return test.done();

          var r =  [
            { name: 'Chiara',    surname: 'Mobily',     age: 22 },
            { name: 'Tony',      surname: 'Mobily',     age: 37 },
            { name: 'Sara',      surname: 'Connor',     age: 14 },
            { name: 'Daniela',   surname: 'Mobily',     age: 64 },
          ];

          compareCollections( test, results, r );
          test.equal( total, 4 );

          g.people.delete( { type: 'eq', args: [ 'name', 'STOCAZZO' ] },  function( err, howMany ){
            test.ifError( err ); if( err ) return test.done();

            test.equal( howMany, 0 );

            g.people.delete( { type: 'eq', args: [ 'name', 'Tony' ] },  function( err, howMany ){
              test.ifError( err ); if( err ) return test.done();

              test.equal( howMany, 1 );

              g.people.select( { },  function( err, results, total ){
                test.ifError( err ); if( err ) return test.done();

                var r =  [
                  { name: 'Chiara',    surname: 'Mobily',     age: 22 },
                  { name: 'Sara',      surname: 'Connor',     age: 14 },
                  { name: 'Daniela',   surname: 'Mobily',     age: 64 },
                ];

                compareCollections( test, results, r );
                test.equal( total, 3 );

                g.people.delete( { type: 'eq', args: [ 'surname', 'Mobily' ] }, { multi: true }, function( err, howMany){
                  test.ifError( err ); if( err ) return test.done();

                  test.equal( howMany, 2 );

                  g.people.select( { },  function( err, results, total ){
                    test.ifError( err ); if( err ) return test.done();

                    var r =  [
                      { name: 'Sara',      surname: 'Connor',     age: 14 },
                    ];

                    compareCollections( test, results, r );
                    test.equal( total, 1 );

                    test.done();
                  })
                });
              })
            })
          });
        });
      })
    },


    "select, or filters": function( test ){
      clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();


        g.people.select( { conditions:
          { type: 'and', args: [
            { type: 'eq', args: [ 'surname', 'Mobily' ] },
            { type: 'or', args: [
              { type: 'eq', args: [ 'age', 22 ] },
              { type: 'eq', args: [ 'age', 37 ] },
            ] },
          ] }
        }, function( err, results, total ){

          test.ifError( err ); if( err ) return test.done();

          var r = [
            { name: 'Tony',      surname: 'Mobily',     age: 37 },
            { name: 'Chiara',    surname: 'Mobily',     age: 22 },
          ];

          test.equal( total, 2 );
          compareCollections( test, results, r );

          g.people.select( { conditions:
            { type: 'or', args: [
              { type: 'eq', args: [ 'name', 'Tony' ] },
              { type: 'eq', args: [ 'name', 'Chiara' ] },
            ] }
          }, function( err, results, total ){

            var r = [
              { name: 'Tony',   surname: 'Mobily', age: 37 },
              { name: 'Chiara', surname: 'Mobily', age: 22 },
            ];

            test.equal( total, 2 );
            compareCollections( test, results, r );

            test.done();
          });
        });
      });
    },

    "select, hardLimitOnQuery": function( test ){
      clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();

        var people2 = new g.Layer( { schema: g.commonPeopleSchema, idProperty: 'name', table: 'people2' } );

        // Delete data, and polulate collection
        people2.delete( { }, { multi: true }, function( err ){
          if( err ) return cb( err );
          populateCollection( peopleData, people2, function( err ){
            if( err ) return cb( err );

            people2.hardLimitOnQueries = 2;

            people2.select( { sort: { age: 1 } }, function( err, results, total, grandTotal ){
              test.ifError( err ); if( err ) return test.done();

              var r =
                [ { name: 'Sara', surname: 'Connor', age: 14 },
                  { name: 'Chiara', surname: 'Mobily', age: 22 } ]
              ;

              test.equal( total, 2 );
              test.equal( grandTotal, 4 );
              compareCollections( test, results, r );

              test.done();
            });
          });
        });
      });
    },


    "select, case insensitive": function( test ){
      clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();


        g.people.select( { conditions: { type: 'eq', args: [ 'surname', 'MObILy' ] } }, function( err, results, total ){
          test.ifError( err ); if( err ) return test.done();

          var r = [
                    { name: 'Tony',      surname: 'Mobily',     age: 37 },
                    { name: 'Chiara',    surname: 'Mobily',     age: 22 },
                    { name: 'Daniela',   surname: 'Mobily',     age: 64 },
                  ];


          test.equal( total, 3 );
          compareCollections( test, results, r );

          g.people.select( { conditions: { type: 'contains', args: [ 'surname', 'ObI' ] } }, function( err, results, total ){
            test.ifError( err ); if( err ) return test.done();

            test.equal( total, 3 );
            compareCollections( test, results, r );

            test.done();
          });
        });
      });
    },

    "select, cast data type": function( test ){
      clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();


        g.people.select( { conditions: { type: 'eq', args: [ 'age', '37' ] } }, function( err, results, total ){
          test.ifError( err ); if( err ) return test.done();

          var r = [
                    { name: 'Tony',      surname: 'Mobily',     age: 37 },
                  ];

          test.equal( total, 1 );
          compareCollections( test, results, r );
          test.done();
        });
      });
    },

    "updates": function( test ){
      clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();

        g.people.update( { type: 'eq', args: [ 'surname', 'Mobily' ] }, { surname: 'Tobily' }, { multi: true }, function( err, howMany ){
          test.ifError( err ); if( err ) return test.done();

          test.deepEqual( howMany, 3 );

          g.people.select( { },  function( err, results, total ){
            test.ifError( err ); if( err ) return test.done();

            var r =  [
              { name: 'Chiara',    surname: 'Tobily',     age: 22 },
              { name: 'Tony',      surname: 'Tobily',     age: 37 },
              { name: 'Sara',      surname: 'Connor',     age: 14 },
              { name: 'Daniela',   surname: 'Tobily',     age: 64 },
            ];


            compareCollections( test, results, r );
            test.equal( total, 4 );

            g.people.update( { type: 'eq', args: [ 'name', 'Tony' ] }, { surname: 'Lobily' }, function( err, howMany ){
              test.ifError( err ); if( err ) return test.done();

              test.deepEqual( howMany, 1 );

              g.people.select( { },  function( err, results, total ){
                test.ifError( err ); if( err ) return test.done();

                var r =  [
                  { name: 'Chiara',    surname: 'Tobily',     age: 22 },
                  { name: 'Tony',      surname: 'Lobily',     age: 37 },
                  { name: 'Sara',      surname: 'Connor',     age: 14 },
                  { name: 'Daniela',   surname: 'Tobily',     age: 64 },
                ];

                compareCollections( test, results, r );
                test.equal( total, 4 );

                g.people.update( { type: 'eq', args: [ 'name', 'Tony' ] }, { name: 'Tony', surname: 'Sobily' }, { deleteUnsetFields: true }, function( err, howMany ){

                  test.ifError( err ); if( err ) return test.done();

                  test.equal( howMany, 1 );

                  g.people.select( { conditions: { type: 'eq', args: [ 'name', 'Tony' ] } },  function( err, results, total ){
                    test.ifError( err ); if( err ) return test.done();

                    test.equal( total, 1 );

                    compareItems( test, results[ 0 ], { name: "Tony", surname: 'Sobily' } );

                    test.done();
                  })
                });
              })
            });
          })
        });
      })
    },

    "refs": function( test ){
      clearAndPopulateTestCollection( g, function( err ){
        test.ifError( err ); if( err ) return test.done();

        var peopleR = new g.Layer( {
          table: "peopleR",
          schema: new g.driver.SchemaMixin( {
            id      : { type: 'id' },
            name    : { type: 'string', searchable: true },
            surname : { type: 'string', searchable: true },
            age     : { type: 'number', searchable: true },

            configId: { type: 'id', required: true } ,
            motherId: { type: 'id', required: false, searchable: true },
          }),
          idProperty: 'id',
          positionField: 'position',
          positionBase: [ ],
          nested: [
            {
              layer: 'addressesR',
              join: { personId: 'id' },
              type: 'multiple',
            },

            {
              layer: 'configR',
              layerField: 'id',
              localField: 'configId',
              type: 'lookup',
            },

            {
              layer: 'peopleR',
              layerField: 'id',
              localField: 'motherId',
              type: 'lookup',
            },

          ]
        });

        var addressesR = new g.Layer( {
          table: 'addressesR',
          schema:
            new g.driver.SchemaMixin( {
              id       : { type: 'id' },
              personId : { type: 'id', required: true, searchable: true },
              configId : { type: 'id', required: false },
              street   : { type: 'string', searchable: true },
              city     : { type: 'string', searchable: true },
            }),
          idProperty: 'id',
          positionField: 'position',
          positionBase: [ 'personId' ],
          nested: [
            {
              layer: 'configR',
              type: 'lookup',
              localField: 'configId',
              layerField: 'id',
            },

           {
              layer: 'peopleR',
              type: 'lookup',
              localField: 'personId',
              layerField: 'id',
            },

          ]
        });

        var configR = new g.Layer( {
          table: 'configR',
          schema: new g.driver.SchemaMixin( {
            id       : { type: 'id' },
            configField  : { type: 'string', searchable: true },
            configValue  : { type: 'string', searchable: true },
          }),
          idProperty: 'id',
        });

        // Zap DB and make up records ready to be added

        /*
          TO TEST:

          INSERTING
          ---------
          [ V ] Insert normal record (configR)
          [ V ] Insert normal record with lookup relationship (peopleR pointing to configR)
          [ V ] Insert record with 1:n relationship (addressesR child of a peopleR)
          [ V ] Insert record with 1:n relationship and a lookup (addressesR child of a peopleR and with a configId)

          UPDATING/DELETING
          -----------------

          [ V ] Update (single) configR: do _all_ fathers get updated/deleted?
          [ V ] Update (mass) configR: do _all_ fathers get updated/deleted?

          [TODO] Update (single) addressesR: does the father get updated/deleted?
          [TODO] Update (mass) addressesR: does the father get updated/deleted?

          SELECT
          ------
          [TODO] Select filtering by subrecord


        */

        function prepareGround( cb ){

          async.eachSeries(
            [ peopleR, addressesR, configR ],
            function( item, cb){
              item.delete( { }, { multi: true }, cb );
            },
            function( err ){
              if( err ) return cb( err );
              cb( null );
            }
          );
        };

        var data = {};

        prepareGround( function(){

          console.log("INITIALISING LAYERS..." );
          g.Layer.init();

          // Insert normal record (configR)

          function insertFirstConfigRecord( cb ){

            console.log("Running insertFirstConfigRecord...");

            data.c1 = {
              configField: 'C1 - Config Field',
              configValue: 'C1 - Config Value'
            };
            g.driver.SchemaMixin.makeId( data.c1, function( err, id ) {
              test.ifError( err ); if( err ) return test.done();
              data.c1.id = id;

              configR.insert( data.c1, function( err ){
                if( err ) return cb( err );

                configR.select( { },  function( err, results, total ){
                  test.ifError( err ); if( err ) return test.done();

                  test.equal( total, 1 );
                  compareCollections( test, [ data.c1 ], results );

                  cb( null );
                });
              });
            });
          };

          function insertSecondConfigRecord( cb ){

            console.log("Running insertSecondConfigRecord...");

            data.c2 = {
              configField: 'C2 - Config Field',
              configValue: 'C2 - Config Value'
            };
            g.driver.SchemaMixin.makeId( data.c2, function( err, id ) {
              test.ifError( err ); if( err ) return test.done();
              data.c2.id = id;

              configR.insert( data.c2, function( err ){
                if( err ) return cb( err );

                configR.select( { },  function( err, results, total ){
                  test.ifError( err ); if( err ) return test.done();

                  test.equal( total, 2 );
                  compareCollections( test, [ data.c1, data.c2 ], results );

                  cb( null );
                });
              });
            });
          };



          function insertFirstPerson( cb ){

            console.log("Running insertFirstPerson...");

            data.p1 = {
              name   : 'Tony',
              surname: 'Mobily',
              age: 38,
              configId: data.c1.id
            };
            g.driver.SchemaMixin.makeId( data.p2, function( err, id ) {
              test.ifError( err ); if( err ) return test.done();

              data.p1.id = id;

              peopleR.insert( data.p1, function( err ){
                if( err ) return cb( err );

                peopleR.select( { },  { children: true }, function( err, results, total ){
                  test.ifError( err ); if( err ) return test.done();

                  // Only one result came back
                  test.equal( total, 1 );

                  var singleResult = results[ 0 ];

                  // Check that configId and addressesR are there and are correct
                  compareItems( test, singleResult._children.configId, data.c1 );
                  test.deepEqual( singleResult._children.addressesR, [] );

                  // Check that results EXCLUDING children are correct
                  delete singleResult._children;
                  compareItems( test, results[ 0 ], data.p1 );

                  cb( null );
                });
              });
            });
          };

          function insertFirstAddress( cb ){

            console.log("Running insertFirstAddress...");

            data.a1 = {
              personId: data.p1.id,
              street  : 'bitton',
              city    : 'perth',
              configId: data.c1.id
            };
            g.driver.SchemaMixin.makeId( data.a1, function( err, id ) {
              test.ifError( err ); if( err ) return test.done();
              data.a1.id = id;


              addressesR.insert( data.a1, function( err ){
                if( err ) return cb( err );

                addressesR.select( { },  { children: true }, function( err, results, total ){
                  test.ifError( err ); if( err ) return test.done();

                  // Only one result came back
                  test.equal( total, 1 );

                  var singleResult = results[ 0 ];

                  // Check that configId and addressesR are there and are correct
                  compareItems( test, singleResult._children.configId, data.c1 );
                  compareItems( test, singleResult._children.personId, data.p1 );

                  // Check that results EXCLUDING children are correct
                  delete singleResult._children;
                  compareItems( test, singleResult, data.a1 );


                  // CHECKING PEOPLE (the address must be added as a child record)
                  peopleR.select( { },  { children: true }, function( err, results, total ){
                    test.ifError( err ); if( err ) return test.done();

                    // Only one result came back
                    test.equal( total, 1 );

                    var singleResult = results[ 0 ];

                    // Check that configId and addressesR are there and are correct
                    compareItems( test, singleResult._children.configId, data.c1 );
                    compareCollections( test, singleResult._children.addressesR, [ data.a1 ] );

                    // Check that results EXCLUDING children are correct
                    delete singleResult._children;
                    compareItems( test, singleResult, data.p1 );

                    cb( null );
                  });
                });
              });
            });
          };

          function insertSecondAddress( cb ){

            data.a2 = {
              personId: data.p1.id,
              street  : 'samson',
              city    : 'perth',
            };
            g.driver.SchemaMixin.makeId( data.a2, function( err, id ) {
              test.ifError( err ); if( err ) return test.done();
              data.a2.id = id;


              addressesR.insert( data.a2, function( err ){
                if( err ) return cb( err );

                addressesR.select( { },  { children: true }, function( err, results, total ){
                  test.ifError( err ); if( err ) return test.done();

                  // Only one result came back
                  test.equal( total, 2 );

                  // Check that personId is correct in both cases
                  compareItems( test, results[ 0 ]._children.personId, data.p1 );
                  compareItems( test, results[ 1 ]._children.personId, data.p1 );

                  // Check that results EXCLUDING children are correct
                  delete results[ 0 ]._children;
                  delete results[ 1 ]._children;
                  compareCollections( test, [ data.a1, data.a2 ], results );

                  // CHECKING PEOPLE (the address must be added as a child record)
                  peopleR.select( { },  { children: true }, function( err, results, total ){
                    test.ifError( err ); if( err ) return test.done();

                    // Only one result came back
                    test.equal( total, 1 );

                    var singleResult = results[ 0 ];

                    // Check that configId and addressesR are there and are correct
                    compareItems( test, singleResult._children.configId, data.c1 );
                    compareCollections( test, singleResult._children.addressesR, [ data.a1, data.a2 ] );

                    // Check that results EXCLUDING children are correct
                    delete singleResult._children;
                    compareItems( test, singleResult, data.p1 );

                    cb( null );
                  });
                });
              });
            });
          }


          function insertSecondPerson( cb ){

            console.log("Running insertSecondPerson...");

            data.p2 = {
              name   : 'Chiara',
              surname: 'Mobily',
              age: 24,
              configId: data.c2.id
            };
            g.driver.SchemaMixin.makeId( data.p2, function( err, id ) {
              test.ifError( err ); if( err ) return test.done();

              data.p2.id = id;

              peopleR.insert( data.p2, function( err ){
                if( err ) return cb( err );

                peopleR.select( { conditions: { type: 'eq', args: [ 'name', 'Chiara' ] } },  { children: true }, function( err, results, total ){
                  test.ifError( err ); if( err ) return test.done();

                  // Only one result came back
                  test.equal( total, 1 );

                  var singleResult = results[ 0 ];

                  // Check that configId and addressesR are there and are correct
                  compareItems( test, singleResult._children.configId, data.c2 );
                  test.deepEqual( singleResult._children.addressesR, [] );

                  // Check that results EXCLUDING children are correct
                  delete singleResult._children;
                  compareItems( test, results[ 0 ], data.p2 );

                  cb( null );
                });
              });
            });
          };


          function insertThirdPerson( cb ){

            console.log("Running insertThirdPerson...");

            data.p3 = {
              name   : 'Sara',
              surname: 'Fabbietti',
              age: 14,
              configId: data.c2.id
            };
            g.driver.SchemaMixin.makeId( data.p3, function( err, id ) {
              test.ifError( err ); if( err ) return test.done();

              data.p3.id = id;

              peopleR.insert( data.p3, function( err ){
                if( err ) return cb( err );

                peopleR.select( { conditions: { type: 'eq', args: [ 'name', 'Sara'  ]  } },  { children: true }, function( err, results, total ){
                  test.ifError( err ); if( err ) return test.done();

                  // Only one result came back
                  test.equal( total, 1 );

                  var singleResult = results[ 0 ];

                  // Check that configId and addressesR are there and are correct
                  compareItems( test, singleResult._children.configId, data.c2 );
                  test.deepEqual( singleResult._children.addressesR, [] );

                  // Check that results EXCLUDING children are correct
                  delete singleResult._children;
                  compareItems( test, results[ 0 ], data.p3 );

                  cb( null );
                });
              });
            });
          };

          function insertThirdAddress( cb ){

            console.log("Running insertThirdAddress...");

            data.a3 = {
              personId: data.p2.id,
              street  : 'ivermey',
              city    : 'perth',
              configId: data.c2.id
            };
            g.driver.SchemaMixin.makeId( data.a3, function( err, id ) {
              test.ifError( err ); if( err ) return test.done();
              data.a3.id = id;


              addressesR.insert( data.a3, function( err ){
                if( err ) return cb( err );

                addressesR.select( { conditions: { type: 'eq', args: [ 'street', 'ivermey'  ] } },  { children: true }, function( err, results, total ){
                  test.ifError( err ); if( err ) return test.done();

                  // Only one result came back
                  test.equal( total, 1 );

                  var singleResult = results[ 0 ];

                  // Check that configId and addressesR are there and are correct
                  compareItems( test, singleResult._children.configId, data.c2 );
                  compareItems( test, singleResult._children.personId, data.p2 );

                  // Check that results EXCLUDING children are correct
                  delete singleResult._children;
                  compareItems( test, singleResult, data.a3 );


                  // CHECKING PEOPLE (the address must be added as a child record)
                  peopleR.select( { conditions: { type: 'eq', args: [ 'name', 'Chiara'  ] } }, { children: true }, function( err, results, total ){
                    test.ifError( err ); if( err ) return test.done();

                    // Only one result came back
                    test.equal( total, 1 );

                    var singleResult = results[ 0 ];

                    // Check that configId and addressesR are there and are correct
                    compareItems( test, singleResult._children.configId, data.c2 );
                    compareCollections( test, singleResult._children.addressesR, [ data.a3 ] );

                    // Check that results EXCLUDING children are correct
                    delete singleResult._children;
                    //compareItems( test, singleResult, data.p3 );
                    //compareItems( test, singleResult, data.a3 );

                    cb( null );
                  });
                });
              });
            });
          };

          function updateSingleConfig( cb ){

            console.log("Running updateSingleConfig...");

            configR.update( { type: 'eq', args: [ 'id', data.c2.id ] }, { configField: 'C2 - Config Field CHANGED', configValue: 'C2 - Config Value CHANGED' }, { multi: false }, function( err ){

              test.ifError( err ); if( err ) return test.done();

              data.c2 = {
                id: data.c2.id,
                configField: 'C2 - Config Field CHANGED',
                configValue: 'C2 - Config Value CHANGED'
              }


              peopleR.select( {}, { children: true }, function( err, results ){

                results.forEach( function( person ){

                  switch( person.name ){
                    case 'Tony':
                      compareItems( test, person._children.configId, data.c1 );
                    break;

                    case 'Chiara':
                      compareItems( test, person._children.configId, data.c2 );
                    break;

                    case 'Sara':
                      compareItems( test, person._children.configId, data.c2 );
                    break;

                    default:
                     test.ok( false, "Name not recognised?" );
                    break;
                  }
                });

                addressesR.select( {}, { children: true }, function( err, results ){

                  results.forEach( function( address ){

                    switch( address.street ){
                      case 'bitton':
                        compareItems( test, address._children.configId, data.c1 );
                      break;

                      case 'ivermey':
                        compareItems( test, address._children.configId, data.c2 );
                      break;

                      case 'samson':
                        test.ok( typeof( address._children.configId ) === 'undefined', "_children.configId should be undefined as configId is undefined" );
                      break;

                      default:
                       test.ok( false, "Street not recognised?" );
                      break;
                    }
                  });

                  return cb( null );;

                });
              });

            });
          };

          function updateMultipleConfig( cb ){

            console.log("Running updateMultipleConfig...");

            configR.update( { type: 'eq', args: [ 'configField', "C2 - Config Field CHANGED" ] }, { configField: 'C2 - Config Field CHANGED AGAIN',
              configValue: 'C2 - Config Value CHANGED AGAIN'
            }, { multi: true }, function( err ){

              test.ifError( err ); if( err ) return test.done();

              data.c2 = {
                id: data.c2.id,
                configField: 'C2 - Config Field CHANGED AGAIN',
                configValue: 'C2 - Config Value CHANGED AGAIN'
              }

              peopleR.select( {}, { children: true }, function( err, results ){

                results.forEach( function( person ){

                  switch( person.name ){
                    case 'Tony':
                      compareItems( test, person._children.configId, data.c1 );
                    break;

                    case 'Chiara':
                      compareItems( test, person._children.configId, data.c2 );
                    break;

                    case 'Sara':
                      compareItems( test, person._children.configId, data.c2 );
                    break;

                    default:
                     test.ok( false, "Name not recognised?" );
                    break;
                  }
                });

                addressesR.select( {}, { children: true }, function( err, results ){

                  results.forEach( function( address ){

                    switch( address.street ){
                      case 'bitton':
                        compareItems( test, address._children.configId, data.c1 );
                      break;

                      case 'ivermey':
                        compareItems( test, address._children.configId, data.c2 );
                      break;

                      case 'samson':
                        test.ok( typeof( address._children.configId ) === 'undefined', "_children.configId should be undefined as configId is undefined" );
                      break;

                      default:
                       test.ok( false, "Street not recognised?" );
                      break;
                    }
                  });

                  return cb( null );;

                });
              });

            });
          };

          function updateSingleAddress( cb ){

            console.log("Running updateSingleAddress...");

            addressesR.update( { type: 'eq', args: [ 'id', data.a1.id ] }, { street: 'bitton CHANGED' }, { multi: false }, function( err ){

              test.ifError( err ); if( err ) return test.done();

              data.a1 = {
                personId: data.p1.id,
                id: data.a1.id,
                street: 'bitton CHANGED',
                city: 'perth',
                configId: data.c1.id,
              }

              peopleR.select( {}, { children: true }, function( err, results ){

                results.forEach( function( person ){



                  switch( person.name ){
                    case 'Tony':
                      // TINGO FAILS, see https://github.com/sergeyksv/tingodb/issues/63
                      compareCollections( test, person._children.addressesR, [ data.a1, data.a2 ] );
                    break;

                    case 'Chiara':
                      compareCollections( test, person._children.addressesR, [ data.a3 ] );
                    break;

                    case 'Sara':
                      compareCollections( test, person._children.addressesR, [ ] );
                    break;

                    default:
                     test.ok( false, "Name not recognised?" );
                    break;
                  }
                });

                addressesR.select( {}, { children: true }, function( err, results ){
                  compareCollections( test, results, [ data.a1, data.a2, data.a3 ] );

                  return cb( null );;

                });
              });

            });
          };

          function updateMultipleAddresses( cb ){

            console.log("Running updateMultipleAddresses...");

            // This is skipped in mongoDb as it's not supported
            if( require('path').basename( process.env.PWD ) === 'simpledblayer-mongo' ){
              return cb( null );
            }

            // This is skipped in tingoDb as it's not supported
            if( require('path').basename( process.env.PWD ) === 'simpledblayer-tingo' ){
              return cb( null );
            }

            // NOTE: This only works with 2.5 and up if using regexps
            // https://jira.mongodb.org/browse/SERVER-1155 (fixed in 2.5.3)
            addressesR.update( { type: 'eq', args: [ 'city', 'perth' ] }, { city: 'perth2' }, { multi: true }, function( err ){

              test.ifError( err ); if( err ) return test.done();

              data.a1 = {
                id: data.a1.id,
                personId: data.p1.id,
                street: 'bitton CHANGED',
                city: 'perth2',
                configId: data.c1.id,
              }

              data.a2 = {
                id      : data.a2.id,
                personId: data.p1.id,
                street  : 'samson',
                city    : 'perth2',
              };

              data.a3 = {
                id      : data.a3.id,
                personId: data.p2.id,
                street  : 'ivermey',
                city    : 'perth',
                configId: data.c2.id
              };


              peopleR.select( {}, { children: true }, function( err, results ){

                results.forEach( function( person ){

                  switch( person.name ){
                    case 'Tony':
                      compareCollections( test, person._children.addressesR, [ data.a1, data.a2 ] );
                    break;

                    case 'Chiara':
                      compareCollections( test, person._children.addressesR, [ data.a3 ] );
                    break;

                    case 'Sara':
                      compareCollections( test, person._children.addressesR, [ ] );
                    break;

                    default:
                     test.ok( false, "Name not recognised?" );
                    break;
                  }
                });

                addressesR.select( {}, { children: true }, function( err, results ){
                  compareCollections( test, results, [ data.a1, data.a2, data.a3 ] );

                  return cb( null );;

                });
              });

            });
          };

          function deleteSingleConfig( cb ){

            console.log("Running deleteSingleConfig...");

            configR.delete( { type: 'eq', args: [ 'id', data.c2.id ] }, { multi: false }, function( err ){

              test.ifError( err ); if( err ) return test.done();

              peopleR.select( {}, { children: true }, function( err, results ){

                results.forEach( function( person ){

                  switch( person.name ){
                    case 'Tony':
                      compareItems( test, person._children.configId, data.c1 );
                    break;

                    case 'Chiara':
                      // TINGO FAILS, see https://github.com/sergeyksv/tingodb/issues/63
                      test.deepEqual( person._children.configId, {} );
                    break;

                    case 'Sara':
                      // TINGO FAILS, see https://github.com/sergeyksv/tingodb/issues/63
                      test.deepEqual( person._children.configId, {} );
                    break;

                    default:
                     test.ok( false, "Name not recognised?" );
                    break;
                  }
                });

                addressesR.select( {}, { children: true }, function( err, results ){

                  results.forEach( function( address ){

                    switch( address.street ){
                      case 'bitton CHANGED':
                        compareItems( test, address._children.configId, data.c1 );
                      break;

                      case 'ivermey':
                        // TINGO FAILS, see https://github.com/sergeyksv/tingodb/issues/63
                        test.deepEqual( address._children.configId, {} );
                      break;

                      case 'samson':
                        test.ok( typeof( address._children.configId ) === 'undefined', "Address with Samson doesn't have configId defined" );
                      break;

                      default:
                       test.ok( false, "Street not recognised?", address.street );
                      break;
                    }
                  });

                  return cb( null );;

                });
              });

            });
          };

          function deleteMultipleConfig( cb ){

            console.log("Running deleteMultipleConfig...");

            configR.delete( {}, { multi: true }, function( err ){

              test.ifError( err ); if( err ) return test.done();

              peopleR.select( {}, { children: true }, function( err, results ){

                results.forEach( function( person ){

                  switch( person.name ){
                    case 'Tony':
                      // TINGO FAILS, see https://github.com/sergeyksv/tingodb/issues/63
                      test.deepEqual( person._children.configId, {} );
                    break;

                    case 'Chiara':
                      // TINGO FAILS, see https://github.com/sergeyksv/tingodb/issues/63
                      test.deepEqual( person._children.configId, {} );
                    break;

                    case 'Sara':
                      // TINGO FAILS, see https://github.com/sergeyksv/tingodb/issues/63
                      test.deepEqual( person._children.configId, {} );
                    break;

                    default:
                     test.ok( false, "Name not recognised?" );
                    break;
                  }
                });

                addressesR.select( {}, { children: true }, function( err, results ){

                  results.forEach( function( address ){

                    switch( address.street ){
                      case 'bitton CHANGED':
                        // TINGO FAILS, see https://github.com/sergeyksv/tingodb/issues/63
                        test.deepEqual( address._children.configId, {} );
                      break;

                      case 'ivermey':
                        // TINGO FAILS, see https://github.com/sergeyksv/tingodb/issues/63
                        test.deepEqual( address._children.configId, {} );
                      break;

                      case 'samson':
                        test.deepEqual( address._children.configId, {} );
                      break;

                      default:
                       test.ok( false, "Street not recognised?" );
                      break;
                    }
                  });

                  return cb( null );;

                });
              });

            });
          };

          function deleteSingleAddress( cb ){

            console.log("Running deleteSingleAddress...");

            addressesR.delete( { type: 'eq', args: [ 'id', data.a3.id ] }, { multi: false }, function( err ){

              test.ifError( err ); if( err ) return test.done();

              peopleR.select( {}, { children: true }, function( err, results ){

                results.forEach( function( person ){

                  switch( person.name ){
                    case 'Tony':
                      // TINGO FAILS, see https://github.com/sergeyksv/tingodb/issues/63
                      compareCollections( test, person._children.addressesR, [ data.a1, data.a2 ] );
                    break;

                    case 'Chiara':
                      // TINGO FAILS, see https://github.com/sergeyksv/tingodb/issues/63
                      compareCollections( test, person._children.addressesR, [ ] );
                    break;

                    case 'Sara':
                      compareCollections( test, person._children.addressesR, [ ] );
                    break;

                    default:
                     test.ok( false, "Name not recognised?" );
                    break;
                  }
                });

                addressesR.select( {}, { children: true }, function( err, results ){
                  compareCollections( test, results, [ data.a1, data.a2 ] );

                  return cb( null );;

                });
              });

            });
          };

          function deleteMultipleAddresses( cb ){

            console.log("Running deleteMultipleAddresses...");

            addressesR.delete( { }, { multi: true }, function( err ){

              test.ifError( err ); if( err ) return test.done();

              peopleR.select( {}, { children: true }, function( err, results ){

                results.forEach( function( person ){

                  switch( person.name ){
                    case 'Tony':
                      compareCollections( test, person._children.addressesR, [ ] );
                    break;

                    case 'Chiara':
                      compareCollections( test, person._children.addressesR, [ ] );
                    break;

                    case 'Sara':
                      compareCollections( test, person._children.addressesR, [ ] );
                    break;

                    default:
                     test.ok( false, "Name not recognised?" );
                    break;
                  }
                });

                addressesR.select( {}, { children: true }, function( err, results ){
                  compareCollections( test, results, [ ] );
                  return cb( null );;

                });
              });

            });
          };


          async.series( [

            insertFirstConfigRecord,
            insertSecondConfigRecord,
            insertFirstPerson,
            insertFirstAddress,
            insertSecondAddress,
            insertSecondPerson,
            insertThirdPerson,
            insertThirdAddress,

            updateSingleConfig,
            updateMultipleConfig,
            updateSingleAddress,
            updateMultipleAddresses,

            deleteSingleConfig,
            deleteMultipleConfig,
            deleteSingleAddress,
            deleteMultipleAddresses,

          ], function( err ){
            test.ifError( err ); if( err ) return test.done();

            test.done();
          });
        });
      });
    },
  }

  if( typeof( makeExtraTests ) === 'function' ){

    // Copy tests over
    var extraTests = makeExtraTests( g );
    for( var k in extraTests ){
      tests[ k ] = extraTests[ k ];
    };
  };

  tests.finish = finish;

  return tests;
}
