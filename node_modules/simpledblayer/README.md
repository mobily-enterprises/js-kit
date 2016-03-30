Simpledblayer
=============

SimpleDbLayer is a module that allows you to connect and query a DB server. It was created specifically to provide a thin database layer for [JsonRestStores](https://github.com/mercmobily/JsonRestStores).

Features:

* Complex queries, with nested AND and OR statements, as well as ranges and sorting
* Full cursor support, including `each()` and a way to break out of `each()`
* Schema to cast/validate fields, using [simpleschema](https://github.com/mercmobily/simpleschema).
* It allows 1-level joins in queryes and data fetching; joins are defined right in the table definition.
* The 1-level join is in the table definition because, using MongoDB, children data will be _preloaded_ and automatically updated. This means that you will be able to fetch the record of a person, with all associated addresses, email addresses, phone numbers, etc. _in one single DB operation_.
* It is written with very simple, Object Oriented code using [simpledeclare](https://github.com/mercmobily/simpleDeclare)
* For each managed database table, there is -- and there _can be_ -- only one plain Javascript object which will manipulate that table.
* Positioning management. You can define the position of a record, which will affect the order they are returned from a query when no sorting is specified (very useful when implementing Drag&Drop in your web application)
* Semi-automatic index generation. Indexes will be created automatically as much as possible. For example, all fields marked as `searchable` will be defined as an index, as well as indexes for positioning.

Limitations:

* It doesn't manage connections. You will have to create a connection to the database and pass it to it. This is due to the module's philosophy of getting in the way as little as possible.
* `update` and `delete` statements don't accept `sort` and `range` (they will either affect one record, or all of them). This is mainly to make sure that pre-caching of children (join/lookup) tables is workable.
* It doesn't implement Models constructors and object types as many other ORMs do (mainly because SimpleDbLayer is _not_ an ORM, but a thin layer around databases).

Once again, all these features (and limitations) are tailored around the fact that SimpleDbLayer is a module that enables [JsonRestStores](https://github.com/mercmobily/JsonRestStores) to have several (thin) database layers.


DOCUMENTATION TODO: Specify that SimpleDbLayer inherits from EventEmitterCollector, and emits collecting events before and after operations. This allows field manipulation on the fly.


# Database-specific adapters

At the moment, here is the list of database-specific adapters:

* MongoDB -- [simpledblayer-mongo](https://github.com/mercmobily/simpledblayer-mongo). In MongoDB joins are implemented with pre-caching, meaning that 1:n relations are pre-loaded in the record itself. This means very, very fast read operations and very tricky update/delete logic in the layer (cached data needs to be updated/deleted as well).
* ...more to come (now that the API is stable)

# Note: "SimpleDbLayer is not an ORM"

SimpleDbLayer is exactly what it says: a (thin) database layer. Most of the other database libraries (such as the excellent [Waterline](https://github.com/balderdashy/waterline)) work in such a way that they define an "Object type" (call it a model, or constructor function) and create objects of that "type":

    // This is NOT how SimpleDbLayer works
    var User = Waterline.Collection.extend({ name: { type: 'string' } } );
    var user = new User();
    user.name = "tony";
    user.save();`.

This is _not_ how SimpleDbLayer works: you don't define models, custom methods for specific models, etc. SimpleDbLayer is a _thin_ layer around database data. In SimpleDbLayer, each managed database table is mapped to exacly _one plain database object_:

    // ...Include module, create database connection, etc.
    var DbLayer = SimpleDbLayer.extend( SimpleDbLayerMongo, { db: db } );

      var people = new DbLayer( {

        table: 'people',

        schema: new SimpleSchema({
          id:      { type: 'id' },
          name:    { type: 'string', required: true },
          surname: { type: 'string', searchable: true },
          age:     { type: 'number', searchable: true },
        }),

        idProperty: 'id',
      });

      people.insert( {id: 1, name: 'Tony', surname: 'Mobily', age: '39' });


The plain Javascript object `people` will have several methods (`people.update()`, `people.select()`, etc.) which will manipulate the corresponding table `people`. There are no types defined, and there are no "models" for that matter. Each created object will manipulate a specific table on the database, and _application-wide, there **must** only be one SimpleDbLayer variable created for each database table_.

When you create `people`, SimpleDbLayer keeps track of the layer created and creates an entry in its internal registry, based on the database table's name. _This means that you can only create one layer variable (a plain Javascript object) per table_. **Attempting to create two different layer variables for the same table will result in an error being thrown. Only one plain Javascript object per DB table is allowed.**

In an applicatiom, you will typically want to define those store objects in a module so that any other module can `require` them.

# Create a DB connection

SimpleDbLayer does not handle DB connections for you. It's your responsibility to connect to the database and pass the connection object to it.
For MongoDB, you can use Mongo's connect call:

    mongo.MongoClient.connect( 'mongodb://localhost/hotplate', {}, function( err, db ){
     // db exists here
    };

# Make up your DB Layer class: mixins

In order to use this library, you will need to _mixin_ the basic SimpleDbLayer class and a DB-specific mixin. If you are not used to mixins, don't be scared: it's simpler than it sounds. Im simple words, requiring `simpledblayer` will return a constructor that doesn't have any of the DB-specific functions in its prototype (not in a meaningful way -- they are just stubs that throws an error). If you try to create an object using the `simpledblayer` and then run `object.select()`, `object.insert()`, etc., you will end up with an error being thrown. By _mixing in_ the constructor returned by `simpledblayer-mongo`, however, you end up with a constructor that creates fully functional objects.

    var SimpleDbLayer = require('simpledblayer'); // This is the main class
    var SimpleSchema = require('simpleschema'); // This will be used to define the schema
    var SimpleDbLayerMongo = require('simpledblayer-mongo'); // This is the layer-specific mixin

    var mongo = require('mongodb');

        // Connect to the database
    mongo.MongoClient.connect('mongodb://localhost/someDB', {}, function( err, db ){

      // DbLayer will be SimpleDbLayer "enhanced" with DB-Specific SimpleDbLayerMongo
      var DbLayer = SimpleDbLayer.extend( SimpleDbLayerMongo, { db: db } );

      // At this point, you can run `var people = new DbLayer( { ... } );

      // Documentation's code will live here

    });

**Please note:** from now on, I will assume that any code referenced in this guide will be surrounded by the code above.

THe critical line is this:

      var DbLayer = SimpleDbLayer.extend( SimpleDbLayerMongo, { db: db } );

Which can also be written as:

      var DbLayer = declare( [ SimpleDbLayer, SimpleDbLayerMongo ], { db: db } );

In this case, you need to also require `simpledeclare` like this: `var declare = require('simpledeclare');`. For first-class, close-to-metal OOP in Javascript have a look at [simpledeclare](https://github.com/mercmobily/simpleDeclare), which is what SimpleDbLayer uses.

Here you are creating a constructor function called `DbLayer`, whose prototype will be the merge of `SimpleDbLayer` (the basic functionalities), `SimpleDbLayerMongo` (the db-specific functions) and a plain object `{db: db }` (used to set the `db` attribute to the database connection)..

# Create your layer object

Once you have your DbLayer class, it's up to you to create objects which will then modify specific database tables:

      var people = new DbLayer( {

        table: 'people',

        schema: new SimpleSchema({
          id:      { type: 'id' },
          name:    { type: 'string', required: true },
          surname: { type: 'string', searchable: true },
          age:     { type: 'number', searchable: true },
        }),

        idProperty: 'id',
      });

`people` is an object tied to the collecton `people` in the MongoDb database..

The second parameter in the constructor (an object defining `table`, `schema` and `idProperty`) is a parameter object, which in this case include 1) The table name 2) The schema definition 3) The `idProperty`, which needs to be set and refer to an existing field.

Simpleschema is an constructor based on [SimpleSchema](https://github.com/mercmobily/SimpleSchema), which provides a way to define extensible schemas with a very simple API. In this case, the `name` field is required whereas `surname` and `age` are not required but are searchable.

Since the `id` field was set as `isProperty`, it will automatically be set as both `required` and `searchable`.

## Note on prototype parameters and the constructor parameter

When you actually create the object with `new`, you pass an object to the constructor: `var people = new DbLayer( { /*...this is an object with the constructor's parameters...*/ });`.

Normally, you would define at least `table`, `schema` and `idProperty` (the required attributes every object needs to work).

Please note that you can define these attribute either in the object's prototype, or in the constructor's parameter. Every property in the constructor's parameter will be added to the created object (overriding the prototype's value).

For example, if all of your tables have `idProperty` set to `id`, you can define a layer like so:

      var DbLayerWithId = SimpleDbLayer.extend( SimpleDbLayerMongo, { db: db, idProperty: 'id' } );

Any object created with this constructor will automatically have the attribute `id` set (in the prototype):

      var people = new DbLayerWithId( {
        table: 'people',
        schema: ...
      });

      // people.idProperty is already 'id' (from the prototype)

 You can always override the prototype-provided value with something else:

     var rocks = new DbLayerWithId( {
        idProperty: 'weirdId',
        table: 'rocks',
        schema: ...
      });
      // rocks.idProperty (an object's own attribute) is 'weirdId',

This means that you can create a constructor with the most common attributes, and only pass the absolute minimum to the constructor.

# Important object attributes

Some attributes are used by the objects to define how the object will work.
They are:

## `hardLimitOnQueries` -- Setting a hard limit on queries. Default: `0`

Cursor-less queries on large data sets will likely chew up huge amounts of memory. This is why you can set a hard limit on queries:

      var DbLayer = SimpleDbLayer.extend( SimpleDbLayerMongo, { db: db, hardLimitOnQueries: 10 } );

This will imply that each _non-cursor_ query will only ever return 10 items max. You can also set this limit on specific objects by passing hardLimitOnQueries as a constructor parameter:

    var DbLayer = SimpleDbLayer.extend( SimpleDbLayerMongo,, { db: db } );
    var people = new DbLayer( {  /* ...layer parameters..., */ hardLimitOnQueries: 10 } );

Note that hardLimtOnQueries only ever applies to non-cursor queries.

## `SchemaError` -- Constructor function used to throw schema validation errors. Default: `Error`

The `insert` and `update` operations will trigger validation against the schema. If validation fails, the callback is called with an error. The error object is created by SimpleDbLayer like this:

    var error = new Error( { errors: errorsArray } );
    error.errors = errorsArray;

The variable `errorsArray` is an array of objects, where each object has `field` and `message` defined. For example:

    [ { field: 'age', message: 'Age is invalid' }, { field: 'name', message: 'Field is required: name' } ]

You can set the constructor used to create the error objects by passing a `SchemaError` parameter when you define the layer:

    var DbLayer = SimpleDbLayer.extend( SimpleDbLayerMongo, { db: db, SchemaError: SomeErrorConstructor } );

As always, you can also define a the SchemaError constructor when creating the object with `new`:

    var DbLayer = SimpleDbLayer.extend( SimpleDbLayerMongo, { db: db } );
    var people = new DbLayer( { /* ...layer parameters..., */ SchemaError: SomeErrorConstructor } );

# Full list of options for SimpleDbLayer

Here is a full list of options that affect the behaviour of SimpleDbLayer objects. Please keep in mind that all of them can me defined either in the constructor's prototype, or as attribute of the constructor's parameter oject.

## Basic properties

* `table`. Required. No default. The table name in the underlying database.
* `schema`. Required. No default. The schema to be used.
* `idProperty`. Required. No default. The property representing the record's ID.
* `hardLimitOnQueries`. Defaults to `0` (no limit). The maximum number of objects returned by non-cursor queries.
* `SchemaError`. Defaults to `Error`. The constructor for `Error` objects.
* `strictSchemaOnFetch`. Defaults to `true`. Every fethed record is validated against the schema. If this is `false`, schema errors will be ignored. If `true`, a schema error will generate an error. This is important if you decide to add a required field to your schema, but don't want to update the actual database.

## Advanced properties

These attributes are explained later in the documentation.

* `positionField`. Defaults to `null` (no positioning). The field used by the database engine to keep track of positioning.
* `positionBase`. Defaults to `[]`. The list of key fields which will `group` positioning
* `fetchChildrenByDefault`. Defaults to `false`; If true, queries returning records will return children by default.
* `nested`. Defaults to `[]`. The 'children' tables for in-table joints.

# Running queries

## Querying: `insert()`

To insert data into your table:

    people.insert( {
      id: 1,
      name: 'Tony',
      surname: 'Mobily',
      age: 37 },
      , function( err, record ){


The second parameter is optional. If you pass it:

* If `children` is `true`, the returned record will also include its children. Default is `false`.
* If `skipValidation` is `true`, then the validation of the data against the schema will be skipped. Default is `false`.
* `If `position` is defined, and table has a `positionField` element, then the record will be placed in the designated spot. The `position` element should be an object with `where` and optionally `beforeId`. See the [Repositioning section](#Repositioning) section in the documentation for details.

# Querying: `update()`

This is a simple update:

    people.update(
      { name: 'startsWith', args: [ 'surname', 'mob' ] },
      { surname: 'Tobily' },
      { deleteUnsetFields: false, multi: true },
      function( err, howMany, record ){

The callback will have `howMany` set as the number of changed records. The `record` parameter is not always there: if `multi` was set as `true`, then `record` is `undefined`. If `multi` was set as `false` (the default), `record` will be either the changed record (if one was updated -- in this case `num` is 1) or `null` (if nothing was updated -- in this case `num` is 0).

The third parameter, here set as `{ deleteUnsetFields: false, multi: true }`, is optional. If you pass it:

* `multi`. If set to `true`, all records matching the search will be updated. Otherwise, only one record will be updated. Default: `false`.
* `deleteUnsetFields`. If set to `true`, then any field that is not defined in the update object will be set as empty in the database. Basically, it's a "full record update" regardless of what was passed. Validation will fail if a field is required by the schema and it's not set while this option is `true`. Default: `false`.
* `skipValidation`. If set to `true`, then the schema validation of the data against the schema will be skipped. Casting will still happen. Default: `false`.

Please note how the filter is an object that defines how data will be filtered. Check the `select` section to see how the filter works.

# Querying: `delete()`

This is a simple delete:

    people.delete(
      { type: 'gt', args: [ 'age', 28 ] },
      { multi: true },
      function( err, howMany, record ){

The callback will have `howMany` set as the number of deleted records.  The `record` parameter is not always there: if `multi` was set as `true`, then `record` is `undefined`. If `multi` was set as `false` (the default), `record` will be either the deleted record (if one was deleted -- in this case `num` is 1) or `null` (if nothing was deleted -- in this case `num` is 0).

The second parameter, here set as `{ multi: true }`, is optional. If you pass it:

* If `multi` is set to `true`, all records matching the search will be deleted. Otherwise, only one record will be deleted. Default: `false`.

# Querying: `select()`

SimpleDbLayer supports both normal and cursor-based queries, depending on the `useCursor` parameter.

## Normal queries

For normal queries:

    people.select(
      {},
      { useCursor: false , delete: false, skipHardLimitOnQueries: false },
      function( err, data, total, grandTotal ){

The first parameter is an object representing the query (more about this later).
The second parameter is optional. If you pass it:

* `useCursor`. If set to `true`, the function will call the call the callback with a cursor rahter than the data. Default: `false`.
* `delete`. If set to `true`, SimpleDbLayer will _delete_ any fetched record. For normal queries, it will delete all records _before_ calling your callback.
* `skipHardLimitOnQueries`. If set to `true`, SimpleDbLayer will ignore the `hardLimitOnQuery` attribute and will return _all_ fetched data. flag. Remember that if you have a very large data set and do not impose any range limits, non-cursor queries will attempt to place the whole thing in memory and will probably kill your server. Default: `false.`.

The callback is called with parameter `data` (the returned records), `total` (the number of records returned) and `grandTotal` (the _total_ number of records that satisfy the query without taking into consideration the required ranges).

## Cursor queries

For cursor queries:

    people.select(
      {},
      { useCursor: true , delete: false },
      function( err, cursor, total, grandTotal ){

The second parameter is optional. If you pass it:

* `useCursor`. If set to `true`, the function will call the call the callback with a cursor rather than the data. Default: `false`.
* `delete`. If set to `true`, SimpleDbLayer will _delete_ any fetched record. For cursor queries, it will delete records as they are fetched with `cursor.next()`. Default: `false`.

Note that for cursor queries `skipHardLimitOnQueries` will be ignored.

The callback is called with parameter `cursor` (the returned cursor), `total` (the number of records returned) and `grandTotal` (the _total_ number of records that satisfy the query without taking into consideration the required ranges).

## Using the cursor

The `cursor` object has the methods `each()`, `next()` and `rewind()`.

### cursor.each( iterator, cb )

This cursor function will call `iterator( item, done )` for each one of the fetched records. Once all of the records have been iterated, `cb()` will be called.
The iterator will have access to `item` (the item just fetched) and to `done( err, breakFlag)` (the function to call at the end of each iteration).
If the iterator calls `done()` with `err` set, then execution will be interrupted and `cb()` will be called with that error set.
If the iterator calls `done()` with `err` set to `null`, but with `breakFlag` set to `true`, then execution will be called and `cb()` will be called with `err` set to `null.`
Here is a typical example of cursor usage:

```javascript
    function cursorExample( done ){

      people.select( {}, { children: true, useCursor: true }, function( err, cursor ){
        if( err ) return done( err );

        cursor.each(

          // This is the iterator. It will be called for each item, and
          // it will call `cb()` after each iteration
          function( item, cb ){

            console.log("ITEM:", item );

            // If item 'Tony' is found, call `cb` with `breakFlag` set to
            // true, which will effectively interrupt the cycle
            if( item.type === 'Tony') return cb( null, true );

            cb( null );
          },

          // This is the function that will be called 1) When all items
          // have been visited OR 2) The iterator called `cb()` with an
          // error OR 3) The iterator called `cb()` with no error, but with
          // `breakFlag` set to true
          function( err ){
            if( err ) return done( err );

            console.log('CYCLE IS OVER. Error:', err );
            done( null );
          }
        );
      });
    }
````
Using `each()` is the most convenient way to use a cursor.

### cursor.next( cb )

`next()` will call the passed callback `cb()` with the next available record, or `null` for the last fetched record.

### cursor.rewind()

`rewind()` will bring the cursor back to the beginning of the returned dataset. You can use `rewind()` within `cursor.each()`, although you run the risk of entering an infinite loop.

## Filtering

The first parameter in select, which up to this point in the documentation was was left as an empty object, is an object with the following parameters:

* `conditions`. It's an object including the attribute `type` (a string representing the type of the conditional operation to perform) and `args` (an array containing the parameters to the operation). For example, `{ type: 'startsWith', args: [ 'surname', 'mob' ] },` will filter all record where the field `surname` starts with `mob`.
* `ranges`. It's an object that can have the attributes `from`, `to` and `limit` set. All attributes are optional. For example `{ limit: 10 }`.
* `sort`. It's an object where each key represents the field the sort will apply to. For each key, value can be `-1` (bigger to smaller)  or `1` (smaller to bigger).

All parameters are optional.

Note that while the parameter passed to `select()` includes `conditions` `ranges`, `sort`, the first parameter passed to `update()` and `delete()` is only passed the `conditions` object. This means that update and delete queries will either affect _all_ records (`multi` is `true`), or _one_ record (`multi` is `false` or not passed).

A possible filtering parameter could be:

    var searchFilter = {
      ranges: {
        from: 3,
        to: 10
      },
      sort: {
        name: -1,
        age: 1
      }
      conditions: {
        type: 'and',
        args: [
          {
            type: 'startsWith',
            args: [ 'name', 'to' ]
          },
          {
            type: 'gt',
            args: [ 'age', 30 ]
          },
        ]
      }
    }

    people.select( searchFilter, function( err, cursor, total, grandTotal ){
      // ...
    });


### The `conditions` object

The conditions object can have the following conditional operators (in `type`):

* `and` -- all conditions in `args` need to be true
* `or` -- at least one condition in `arts` needs to be true

And the following logical operators (where the value of the field called `args[0]` will need to match `args[1]`):

* `lt` -- less than
* `lte` -- less or equal than
* `gt` -- greater than
* `gte` -- greater or equal than
* `eq` -- equal to
* `contains` -- string contains
* `startsWith` -- string starts with
* `endsWith` -- string ends with

An example could be:

    {
      type: 'and',
      args: [
        {
          type: 'startsWith',
          args: [ 'name', 'to' ]
        },

        {
          type: 'or',
          args: [
            {
              type: 'gt',
              args: [ 'age', 30 ]
            },
            {
              type: 'lt',
              args: [ 'age', 10 ]
            },
          ]
        }
      ]
    }

Which means `name startsWith 'to' AND ( age > 30 OR age < 10 )`.



# Automatic loading of children (joins)

It is common, in application, to need to load a user's information as well as all several pieces of information related to him or her: all email addresses, all phone numbers, etc.

While SimpleDbLayer doesn't suppose joining of tables at query time, it does support joining of tables ad _table definition_ time. This means that you can define how two tables are related before hand.

The main aim of this mechanism is to allow pre-caching of data whenever possible. So, if you have a table `people` and a table `emails`, and they are have a 1:n relationship (that is, the `emails` table contains a `personId` field which will make each record related to a specific person), every time you load a record from `people` you will also automatically load all of his or her email addresses. DB-specific functions will do their best to pre-cache results. This means that, if you are using MongoDB, you can fetch a person's record as well as _any_ information associated with it (email addresses, addresses, phone numbers, etc.) **in a single read**.

## Define nested layers

You can now define a layer as "child" of another one:

    var people = new DbLayer({

      table: 'people',

      schema: new SimpleSchema({
        id     : { type: 'id' },
        name   : { type: 'string', required: true },
        surname: { type: 'string', searchable: true },
        age    : { type: 'number', searchable: true },
      }),

      idProperty: 'id',

      nested: [
        {
          type: 'multiple',
          layer: 'emails',
          join: { personId: 'id' },
        },
      ]

    });

    var emails = new DbLayer({

      table: 'emails',

      schema: new SimpleSchema({
        id      : { type: 'id' },
        personId: { type: 'id' },
        address : { type: 'string', required: true, searchable: true },
      }),

      idProperty: 'id',

      nested: [
        {
          type: 'lookup',
          localField: 'personId'
          layer: people,
          layerField: 'id',
        }
      ],
    });

    SimpleDbLayer.init(); // <--- IMPORTANT!

**It's absolutely crucial that you run `SimpleDbLayer.init()` before running queries if you have nested layers.**

Whenever you load a record from the `people` table, you will also get a `_children` attribute for that object that will include all children data. `lookup`s will become one single object, whereas `multiple`s will become array of objects. Note: children are always loaded into `_children`, which cannot be changed. This is to keep things sane code-wise and data-wise.

If you see carefully, `people` is defined like this:

    var people = new DbLayer({

      table: 'people',
      // ...
      nested: [
        {
          type: 'multiple',
          layer: 'emails', // <-- note: this is a string! Will do a lookup based on the table
          join: { personId: 'id' },
        },
      ]

A layer is a simple Javascript object linked to a specific table. However, when defining the layer `people`, the layer `emails` isn't defined yet -- and yet, you might need to reference it while creating relationships between layers (like in this case: a person has multiple email addresses, but `emails` hasn't been created yet).

The solution is to pass the string `'email'` for the `layer` property. When you run `SimpleDbLayer.init()`, SimpleDbLayer will go through every `nested` option of every defined layer thanks to the registry, and will also work to 'resolve' the string (based on the table's name: in this case, `emails`).

### Single lookup

For single lookup nesting, `nested` is an array of nested table, each one defining:

* `type`. The type of relationship. In this case, `lookup`.
* `localField`. The field in the local table linking to an external record.
* `layer`. The layer object representing the table you are linking to. NOTE that if you have a string instead of an object, the layer object will be looked up using the passed string as a table name.
* `layerField`. The field, in the foreing table, you are linking to

The way you read this example is "create a `personId` entry in `_children` where `people.id` is the same as the local `personId`". So when you load an email, you will have an attribute in `_children` called `personId` which will contain the full person's record.

### Multiple lookup

For multiple lookup nesting,

`nested` is an array of nested table, each one defining:

* `type`. The type of relationship. In this case, `multiple`.
* `layer`. The layer object representing the table you are linking to. NOTE that if you have a string instead of an object, the layer object will be looked up using the passed string as a table name.
* `join`. An object, where each key represents the foreign layer's field, and each value represents the local field.

The way you read this example is "create a `emails` array in `_children` where including all records in `email` where `emails.personId` is the same as the local `id`". So when you load a person, you will have an attribute in `_children` called `emails` which will contain all of the matching email records.

## Searching

The fact that two tables are joined means that you can run queries on children records as well as on its "main" records.

For example, you can run a query like this:


    var conditions = {
      type: 'and',
      args: [
        {
          type: 'startsWith',
          args: [ 'emails.address', 'ton' ]
        },
        {
          type: 'gt',
          args: [ 'age', 30 ]
        },
      ]
    }
    people.select( { conditions: conditions }, { children: true }, function( err, data ){
      if( err ) return cb( err );

      console.log("Data: ", data );
    });

This query will return all record with an email address starting with `ton`. In MongoDB, this happens by performing a query in the `_children` attribute of the record. In relational (uncached) databases, a JOIN will be used instead.

## Caching layers

Some layers (notably, MongoDB) lack the ability to do joins. To minulate joins, normally you would need to run an extra query for each fetched record. This would potentially put a strain on the database server.

Layers might then implement pre-caching of children records. In such a case, you will need functions to mark records and collections "dirty" -- meaning that their children's basic structure has changed, and the cache s no longer reliable.

SimpleDbLayer provides three functions to deal with this:

### dirtyRecord( obj, cb )

It will mark the record dirty.

### dirtyAll( cb )

It will mark all records dirty

### dirtyAllParents( cb )

It will mark all records of all parent tables dirty. This is probably the most useful function, which should be run whenever you change the structure of a table.

## Practical examples

Here is a practical example of what happens when adding data with nested tables:

```javascript
    function addPeople( cb ){

      var opt = { children: true };
      people.insert( { id: 1, name: 'Tony', surname: 'Mobily', age: 37 }, opt, function( err, recordTony ){
        if( err ) return cb( err );

        people.insert( { id: 2, name: 'Chiara', surname: 'Mobily', age: 25 }, opt, function( err, recordChiara ){
          if( err ) return cb( err );

          people.insert( { id: 3, name: 'Sara', surname: 'Fabbietti', age: 15 }, opt, function( err, recordSara ){
            if( err ) return cb( err );

            cb( null);
          });
        });
      });
    }

    function addEmails( cb ){

      var opt = { children: true };

      emails.insert( { id: 1, personId: 1, address: 'tonymobily@gmail.com' }, opt, function( err, tonyEmail1 ){
        if( err ) return cb( err );

        emails.insert( { id: 2, personId: 1, address: 'merc@mobily1.com' }, opt, function( err, tonyEmail2 ){
          if( err ) return cb( err );

          emails.insert( { id: 3, personId: 2, address: 'chiaramobily@gmail.com' }, opt, function( err, chiaraEmail1 ){
            if( err ) return cb( err );

            cb( null, tonyEmail1, tonyEmail2, chiaraEmail1 );
          });
        });
      });
    }


    function fetchTony( cb ){

      var opt = { children: true };

      emails.select( { conditions: { type: 'eq', args: [ 'id', 1 ] } }, opt, function( err, data ){
        if( err ) return cb( err );

        cb( null, data[ 0 ]);

      });
    }

    function deleteEmailsStartingWithTon( cb ){

      emails.delete( {  type: 'and', args: [  { type: 'startsWith', args: [ 'address', 'TON' ] } ] }, { multi: true }, function( err, n ){
        if( err ) return cb( err );
        cb( null, n );
      });
    }


    function runTest( cb ){

      addPeople( function( err, recordTony, recordChiara, recordSara ){
        if( err ) return cb( null );

        /*
        At this point, recordTony is:
        { id: 1,
          name: 'Tony',
          surname: 'Mobily',
          age: 37,
         _children: { emails: [] }
        }

        recordChiara is:
        { id: 2,
          name: 'Chiara',
          surname: 'Mobily',
          age: 25,
         _children: { emails: [] }
        }

        recordSara is:
        {
          id: 3,
          name: 'Sara',
          surname: 'Fabbietti',
          age: 15,
          _children: { emails: [] }
        }
        */

        addEmails( function( err, tonyEmail1, tonyEmail2, chiaraEmail1 ){
          if( err ) return cb( null );

          /*
          At this point, tonyEmail1 is:

          { id: 1,
            personId: 1,
            address: 'tonymobily@gmail.com',
            _children:
             { personId:
                { id: 1,
                  name: 'Tony',
                  surname: 'Mobily',
                  age: 37,
                  __uc__surname: 'MOBILY',
                  _children: {}
                }
              }
          }

          tonyEmail2 is:

          { id: 2,
            personId: 1,
            address: 'merc@mobily1.com',
            _children:
             { personId:
                { age: 37,
                  id: 1,
                  name: 'Tony',
                  surname: 'Mobily',
                  __uc__surname: 'MOBILY',
                  _children: {}
                }
              }
          }

          chiaraEmail1 is:

          { id: 3,
            personId: 2,
            address: 'chiaramobily@gmail.com',
            _children:
             { personId:
                { id: 2,
                  name: 'Chiara',
                  surname: 'Mobily',
                  age: 25,
                  __uc__surname: 'MOBILY',
                  _children: {}
                }
              }
          }

          Note that each email address has an entry in _children called personId,
          which represents the record.
          */

          fetchTony( function( err, tonyRecord ){
            if( err ) return cb( null );

            /*
            At this point, tonyRecord includes all email addresses related to that record
            as an array in _children:

            { id: 1,
              name: 'Tony',
              surname: 'Tobily',
              age: 37,
              _children:
               { emails:
                  [ { id: 1,
                      personId: 1,
                      address: 'tonymobily@gmail.com',
                      _children: {} },
                    { id: 2,
                      personId: 1,
                      address: 'merc@mobily1.com',
                      _children: {}
                    }
                  ]
                }
            }
            */

            deleteEmailsStartingWithTon( function( err, n ){
              if( err ) return cb( null );

              fetchTony( function( err, tonyRecord ){
                if( err ) return cb( null );

                /*
                At this point, the record in emails with id 1 (the only one with an email
                address started with "ton") is gone. More importantly, when fetchng 'Tony" this is what
                will return (notice how the deleted email address is gone)

                { id: 1,
                  name: 'Tony',
                  surname: 'Tobily',
                  age: 37,
                  _children:
                   { emails:
                      [
                        { id: 2,
                          personId: 1,
                          address: 'merc@mobily1.com',
                          _children: {}
                        }
                      ]
                    }
                }
                */

              });
            });
          });
        });
      });
    }
```

The most important thing to remember is that when you use MongoDB in your backend, you will only perform a single read operation when you fetch a person. The children data is cached within the record. Any update operation will affect the main table, as well as any tables holding cached data.

This means that if the email record with ID 2 (`merc@mobily1.com`) is updated, then the cache for the personId with ID 1 will also be updated so that the email address is correct.

# Positioning

When records are fetched (using `select`) without chosing any `sort`ing options, they are returned in whichever order the underlying database server returns them. However, in web applications you often want to be able to decide the `placement` of an element, in order to allow drag&drop sorting etc.

Positioning is tricky to manage from the application layer, as changing a field's position requires the update of several records in the database. This is why SimpleDbLayer handles (re)positioning for you.

## Basic positioning

If you have a "flat" table, you can simply define the `positionField` attribute when you define the constructor:

    var people = new DbLayer( 'people', {

      schema: new SimpleSchema({
        id: { type: 'id' },
        name: { type: 'string', required: true },
        surname: { type: 'string', searchable: true },
        age: { type: 'number', searchable: true },
      }),

      idProperty: 'id',

      positionField: 'position',
    } );

Note that `positionField` is _not_ defined in the schema. In fact, it will be completely _invisible_ to the application using SimpleDbLayer: it won't be returned in `select` queries, and won't be updatable.

Imagine that you add some data:

    var tony = { id: 1, name: 'Tony', surname: 'Mobily', age: 39 };
    var chiara = { id: 2, name: 'Chiara', surname: 'Mobily', age: 25 };

    people.insert( tony, , function( err, tony ){
      if( err ) return cb( err );

      people.insert( chiara, , function( err, chiara ){
        if( err ) return cb( err );
        // ...

Since the `positionField` is defined, and since `insert()` by default positions new records at the end, the data on the database will actually be:

    [
      { id: 1,
        name: 'Tony',
        surname: 'Mobily',
        age: 39,
        position: 1
      },

      { id: 2,
        name: 'Chiara',
        surname: 'Mobily',
        age: 25,
        position: 2
      }
    ]

Note the `position` field. Also remember that the `position` field will always be hidden from you by SimpleDbLayer, when returning queries.

However, when running a select:

    people.select( {}, function( err, list ){
      if( err ) return cb( err );

      // ...
    });

Since there is no `sort` option specified, you are _guaranteed_ that `list` will return the records in the right order (`Tony` first, and `Chiara` second).

## Positioning at insert time

When inserting a record, you can decide its position by passing a `position` parameter to the `insert()` call. `position` can have:

* `where`. It can be `start`, `end` or `before`. If it's `before`, then the next parameter `beforeId` comes into play. Default: `end`.
* `beforeId`. If `where` is `before`, then the new record will be placed before `beforeId`.

So, for example:

````javascript
    var sara = { id: 3, name: 'Sara', surname: 'Fabbietti', age: 15 };
    var marco = { id: 4, name: 'Marco', surname: 'Fabbietti', age: 54 };
    var dion = { id: 5, name: 'Dion', surname: 'Patelis', age: 38 }

    // The record will be placed first
    people.insert( sara, { position: 'start' }, function( err, sara ){
      if( err ) return cb( err );

      // The record will be placed before ID 2 ('Chiara')
      people.insert( marco, { position: 'before', beforeId: 2 }, function( err, marco ){
        if( err ) return cb( err );
        // ...

        // The record will be placed last
        people.insert( dion, { position: 'end' }, function( err, dion ){
          if( err ) return cb( err );
          // ...
````


## Repositioning

You can decide to move a record `after` inserting it. This is especially useful in case a user moves a record using Drag & Drop in your web application.

To reposition a record, just run `reposition`:

    // Move "Chara" to the start, position 1.
    people.reposition( chiara, 'start`, null, function( err ){
      if( err ) return cb( err );

      // ...
    });

The call `reposition( record, where, beforeId )` will take the following parameters:

* `record`. This is the record that will be repositioned.
* `where`. It can be `start`, `end`, or `before`.
* `beforeId`. If `where` is `before`, then `record` will be positioned before the one with ID `beforeId`.

## Nested record positioning

In most cases, your records will be "nested" to other ones. Imagine the two layers we have dealt with up to this point, `people` and `emails`:

    var people = new DbLayer({

      table: 'people',

      schema: new SimpleSchema({
        id     : { type: 'id' },
        name   : { type: 'string', required: true },
        surname: { type: 'string', searchable: true },
        age    : { type: 'number', searchable: true },
      }),

      idProperty: 'id',
    });

    var emails = new DbLayer({

      table: 'emails',

      schema: new SimpleSchema({
        id      : { type: 'id' },
        personId: { type: 'id' },
        address : { type: 'string', required: true, searchable: true },
      }),

      idProperty: 'id',
    });

Each person will have a number of emails -- all the ones with the corresponding `personId`. When dealing with positioning, you need to take into account what fields define the 'ordering grouping': placing an email address before another one should only ever affect the records belonging to the same person.

This is where the `positionBase` array comes in.

This is how you would make the `emails` layer able to handle positioning:

    var emails = new DbLayer({

      table: 'emails',

      schema: new SimpleSchema({
        id      : { type: 'id' },
        personId: { type: 'id' },
        address : { type: 'string', required: true, searchable: true },
      }),

      idProperty: 'id',

      positionField: 'position',
      positionBase: [ 'personId' ],
    });

The attribute `positionBase` basically decides the domain in which the reordering will happen: only records where `personId` matches the moving record's `personId` will be affected by repositioning.

This means that repositioning one of Tony's email address will not affect the order of Chiara's email address.

Note that all elements in `positionBase` will need to be defined in the schema, and that they will be forced as `searchable` and `required`.

# Indexing

You can create and delete indexes using SimpleDbLayer.
The methods are:

## `makeIndex( keys, name, options, cb )`

The method `makeIndex` will create an index. When calling the function:

* `keys` is an hash where each key is the field name, and each value can be `1` (ascending order) or `-1` (descending order). So, if you have `{ name: 1, surname: 1 }`, the database will be instructed to create an index with the fields `name` and `surname`, both in ascending order.
* `name` is the name of your index.
* `options` is a hash where: `{ background: true }` will start the process in background; `unique` will instruct the database that the index will need to be unique; `name` will force the index name to a specific label, rather than the database's default.

## `dropIndex( name, cb)`

This metod `dropIndex()` will drop an index.

## `dropAllIndexes()`

The method `dropAllIndexes` will drop all indexes for the table/collection.

## `generateSchemaIndexes( options, callback )`

This function is used to generate indexes depending on what fields are marked as `searchable` in the schema. Where `options` is an options object. Possible keys:

* `background`. If `true`, indexes will be generated in the background and the `callback` will be called immediately.

The implementation of this depends on the capabilities and architecture of the database server you are using. The goal is to make sure that the most common searches are based on indexes, leaving you the task of adding only the special cases by hand.

In most cases, database engines should at least create the following:

* The `idProperty` field will be indexed, and will be marked as `unique`.
* Any field marked as `searchable` will be indexed. If `indexBase` is defined as an array, every field marked as `searchable` will be indexed with the `indexBase` values as prefix.
* If `positionField` is set, then `positionField` will also be indexed (along with its `positionBase`)
* If `extraIndexes` is set, any index defined there will be created. Since extraIndexes are added last, it can also be used to override existing indexes (as long as the names match).

(Note: for MongoDB, which pre-caches children records within the main records, indexes will be created for the sub-fields as well, voiding indeing of foreign keys whenever possible (although _some_ wastage does happen)).

Imagine that you have a schema so defined:

    var people = new DbLayer({

      table: 'people',

      schema: new SimpleSchema({
        workspaceId : { type: 'id', searchable: true },
        id          : { type: 'id' },
        name        : { type: 'string', searchable: true, required: true },
        surname     : { type: 'string', searchable: true },
        age         : { type: 'number' },
      }),

      // ID property
      idProperty: 'id',

      // Position fields
      positionField : 'position',
      positionBase: [ 'workspaceId' ],

      // Indexes properties
      indexBase: [ 'workspaceId']
      extraIndexes: {
        name: 'nameSurname',
        options: { },
        keys   : { name: 1, surname: 1 },
      },

    });

Note that `positionField` is set as `position`, and that each workspace will have its own ordering thanks to `positionBase` set to `[ 'workspaceId' ]`. Also, note that there is also `indexBase` set as `[ 'workspaceId' ]`, which tells SimpleDbLayer that most searches will be done with `workspaceId` set.
The following indexes will generally be created:

* `idProperty`. It will be marked as `unique` so that there won't be any duplicates.
* `name`. The straight "name" field.
* `surname. The straight "surname" field.
* `workspaceId+name`. The "name" field, index with a prepending `workspaceId` (since most searches will be likely to include it)
* `workspaceId+surname`. The "surname" field, index with a prepending `workspaceId` (since most searches will be likely to include it).
* `workspaceId+position`. The "position" field, including the `positionBase` (since sorting will always be based on `positionBase`).
* `name+surname`. This will be created thanks to `extraIndexes`, which is used to create indexs for common cases like this one

Basically, simpleDbLayer covers the most common scenarios in terms of indexing, with the flexibility of defining extra indxes with `extraIndexes` (for example for `name+surname`), so that slow queries are avoided at all costs minimising wastage in terms of indexing.

### Customising what `generateSchemaIndexes()` does

To define custom indexes that cannot be covered with the options above, or to perform extra db-specific operations while creating indexes, you could override the `generateSchemaIndexes` method for your layer:

    var people = new DbLayer({

      table: 'people',

      schema: new SimpleSchema({
        workspaceId : { type: 'id' },
        id          : { type: 'id' },
        name        : { type: 'string', searchable: true, required: true },
        surname     : { type: 'string', searchable: true },
        age         : { type: 'number' },
      }),

      idProperty: 'id',

      positionField : 'position',
      positionBase: [ 'workspaceId' ],

      indexBase: [ 'workspaceId'],

      generateSchemaIndexes: function f( options, callback ){
        var self = this;

        // Call the original call
        this.inheritedAsync( f, arguments, function( err ){
          if( err ) return callback( err );

          // Make indexes for name and surname together
          self.makeIndex( { name: 1, surname: 1 }, 'nameSurname', options, function( err ){
            if( err ) return callback( err );

            // Make indexes for name and surname including the workspaceId
            self.makeIndex( { workspaceId: 1, name: 1, surname: 1 }, 'workspaceIdNameSurname', options, function( err ){
              if( err ) return callback( err );

              // All good, return!
              callback( null );
            });
          }),
        });

      },
    });


(Yes, this particular example could have easily been done with `extraIndexes`). Note that in this code the original `generateSchemaIndexes()` function was overridden by a custom one. However, the original call was actually called thanks to `this.inheritedAsync()` (which is available thanks to simpleDeclare). Then `self.nameIndex()` was called twice, with the new indexes.


# Class-level functions

Each constructor that inherits from SimpleDbLayer has some "class functions" available. The functions are actially copied, father to descendant, by simpleDeclare.

## Layer registry functions

SimpleDbLayer keeps a registry of layers (indexed by table name, which is unique). The registry is accessible through class calls.

This mechanism is very handy when you want to define your layers objects in a module within your program, and then want to access those variables anywhere in your program.

The registry is also used by SimpleDbLayer itself when you reference a nested layer with a string rather than a layer object (the layer object is looked by table name).

Here are the registry functions:

### DbLayer.getLayer( table )

The function `DbLayer.getLayer( table )` will return a single layer from the layer registry:

    emails = DbLayer.getLayer( 'emails' )
    // Layer variable 'email' is now ready to be used to insert, delete, etc.

### DbLayer.getAllLayers()

The function `DbLayer.getAllLayers()` will return _all_ layers in the registry:

    allLayers = DbLayer.getAllLayers()
    // allLayers is now { emails: [Object], people: [Object], ... }

As you can see, allLayers is a hash object where each key is the layer's name.

## Global index manipulation functions

SimpleDbLayer provides two class-level functions that affect indexes for all the layers in the registry:

### `SimpleDbLayer.generateSchemaIndexesAllLayers( options, callback )`.

This function does what it says: it generates all schema indexes for every layer defined in the registry. Parameters:

* `options`. Any options that will be passed to each `generateSchemaIndexes()` call. Especially useful when you want to pass `{ background: true }`.
* `callback`. The callback that will be called.

### `SimpleDbLayer.dropAllIndexesAllLayers( callback)`.

This function drops all indexes for every layer defined in the registry. Parameters:

* `callback`. The callback that will be called.
