SimpleSchema
=============

SimpleSchema is a _simple_ library to validate objects and cast their attributes according to their (schema) types.

It uses [SimpleDeclare - Github](https://github.com/mercmobily/simpleDeclare) in order to define a constructor function (see: 'class'). I strongly recommend using SimpleDeclare to create derivative schemas (which are very easy to create).

SimpleSchema is a required module when you try and use [JsonRestStores - Github](https://github.com/mercmobily/JsonRestStores). SimpleSchema was in fact part of JsonRestStores, and then "taken out" as it's useful in its own right.

Main features:

* It's easy to use and extend
* It's tailored for `req.body`, built for casting simple (not nested) data strucures
* Allows sync an async validation
* It provides DB-specific layers to handle database IDs
* It's actively used in a complex project, [JsonRestStores](https://github.com/mercmobily/JsonRestStores)
* It down-to-earth code: no trickery and complex object structures
* Fully unit-tested

# Brief introduction

Here is how to use SimpleSchema:

    var Schema = require( 'simpleschema' );

    personSchema = new Schema( {
      name: { type: 'string', trim: 20 },
      age:  { type: 'number', default: 30, max: 140 },
      rank: { type: 'number', default: 99, max: 99, doNotSave: true },
    });

In a normal node/Express application, you would simply use the `validate()` method of personSchema against `req.body`:

    // Definition of a standard callback

    formSubmit( req, res, next ){

      // Apply async, record-wise validation to req.body
      personSchema.validate( req.body, {}, function( err, newBody, errors ){

        if( err ){
          next( err );
        } else {

          if( errors.length) {
             // Do what you normally do when there is an error,
             // ...
          } else {
            // ...

            // The newBody.rank and newBody.age attributes are now proper Javascript numbers

            // Imagine that the field `rank` is not to be part of the DB.
            // `personSchema.cleanup()` will delete from `newBody` all fields with `doNotSave` defined in the schema
            personSchema.cleanup( newBody, 'doNotSave' );

            // Write `newBody` to the database
            // ...
          }
        }
      })

This ensures that all values are cast appropriately (everything in `req.body` comes as a string, whereas you will want `age` and `rank` as proper Javascript numbers).

Note that in this field:

      rank: { type: 'number', default: 99, max: 99, doNotSave: true },

* `type` is the field type. It means that when running personSchema.validate(), `rank` will be cast as a number
* `default`, `max`, `doNotSave` are the "field parameters".

## The schema description: all features

Here is a schema which covers _every_ single feature in terms of types and parameters (parameters will not be repeated):

    // If there is an error, the validator function will need to return a string describing it.
    // otherwise, return nothing.
    var fieldValidatorFunc =  function( obj, value, fieldName ){
      if( value == 130 ) return 'Age cannot be 130';
      return;
    };

    complexSchema = new Schema({
      name:    { type: 'string', default: 'SOMETHING', uppercase: true, trim: 4, required: true, notEmpty: true },
      surname: { type: 'string', lowercase: true },
      age:     { type: 'number', default: 15, min: 0, max: 130, validator: fieldValidatorFunc, extraParameter: true },
      id:      { type: 'id' },
      date:    { type: 'date' },
      list:    { type: 'array' },
      various: { type: 'serialize', required: false },
      location:{ type: 'geo', geoType: 'Point'}
    }
    },
    {
      // Validation function called by schema.validate() for async validation
      validator: function( object, originalObject, castObject, options, done ){
        var errors = [];

        if( object.surname == 'Smith' ){
           errors.push( { field: 'name', message: 'Smith is not an acceptable name' } );
        }
        done( null, errors );
      }
    });

Note:

 * Casting to the field's type (depending on `type`) always happens first; parameters are applied afterwards
 * If casting fails, the parameters for that field will not be applied (and `errors` will have the casting error on that field)
 * The order of parameters matters. Parameters are processed in the order they are encountered. If you have `{ default: 'something', uppercase: true }`, the result will be `Something`.
 * the `serialize` type will convert an object into a string. You need to use the option `{ deserialize: true }` if you want to do the opposite.
 * `min`, `max` on `string`s will check the string length; on `number`s will check number value
 * `uppercase`, `lowercase`, `trim` will only apply to `string`s
 * `required` will fail if the  object's corresponding attribute (before casting) was `undefined` and will never fail for arrays;
 * `notEmpty` will fail if the  object's corresponding attribute was `v == ''` (note the weak `==`) and will never fail for arrays
 * If `fieldValidatorFunc` returns a string, then an error will be added for that field. Note that this function is synchronous
 * The `validator()` function is applied at object level and is asynchronous.
 * Type `geo` only accepts `Point` as `GeoType` at this stage. The passed value is an object with key "coordinates", like so: `{ coordinates: [ x, y ] }`. You can also pass a string, which will be interpreted as JSON.



# Validating against a schema

Validation happens with the `schema.validate()` function:

    complexSchema.validate( object, {}, function( err, validatedObject, errorsArray ){

The `validate()` function takes the following parameters:

 * The object to validate
 * An optional `options` object with extra options
 * A callback, called with `validatedObject` (the new object with validation applied) and `errors` (an array with the list of errors triggered during validation)

Here is an example of basic usage:

    p = {
      name: 'TOnyName',
      surname: 'MOBILY',
      age: '37',
      id: 3424234424,
      date: '2013-10-10',
      list: [ 'one', 'two', 'three' ],
      various: { a: 10, b: 20 }
    }

    complexSchema.validate( p, function( err, newP, errors ){
      // ...
    });

`newP` will be:

    { name: 'TONY',
      surname: 'mobily',
      age: 37,
      id: 3424234424,
      date: Thu Oct 10 2013 08:00:00 GMT+0800 (WST),
      list: [ 'one', 'two', 'three' ] },
      various: '{"a":10,"b":20}'
    }

And `errors` will be empty. Note that `name` is uppercase and trimmed to 4, `surname` is lowercase, `age` is now a proper Javascript number, `date` is a proper date.

## The unidirectional `serialize` parameter

In some cases, you might want `serialize` to work the other way around: you want to convert a JSON string into an object. This is common if, for example, you want to 1) Receive the data via `req.body` 2) Store the data after `schema.validate()` (any `serialize` field will be serialized) 3) Later on, fetch the data from the database 4) Validate that data against the same schema (in which case, you will use the option `{ deserialize: true }`).

For example:

    var Schema = require( 'simpleschema' );
    var declare = require( 'simpledeclare' );
    var MongoSchemaMixin = require('simpleschema-mongo')

   personSchema = new Schema( {
      name: { type: 'string', trim: 20 },
      surname: { type: 'string', trim: 20 },
      data: { type: 'serialize', required: true },
    });

    p = {
      name: 'Tony',
      surname: 'Mobily',
      data: { a: 10, b: 20 }
    }

    personSchema.validate( p, function( err, newP, errors ){
      if( err ) {
        console.log("Err!");
        console.log( err );
      } else {

        // At this point, newP.data is '{"a":10,"b":20}'
        if( errors.length ){
          console.log("Validation errors!");
          console.log( errors );
        } else {

          console.log("newP:");
          console.log( newP );

          personSchema.validate( newP, { deserialize: true }, function( err, newerP, errors ){
            if( err ) {
              console.log("Err!");
              console.log( err );
            } else {

              // At this point, newP.data is an object
              if( errors.length ){
                console.log("Validation errors!");
                console.log( errors );
              } else {
                console.log("newerP:");
                console.log( newerP );
              }
            }
          })
       }
      }
    });

## The return `errors` array

The `errors` variable is an array of objects; each element contains `field` (the field that had the error) and `message` (the error message for that field). For example:

    [
      { field: 'age', message: 'Age cannot be 150' },
      { field: 'name', message: 'Name not valid' }
    ]

A field can potentially have more than one error message attached to it.

## The `options` object

The second parameter of `schema.validate()` is an (optional) options object. Possible values are:

### `onlyObjectValues`

This option allows you to apply `schema.validate()` only to the fields that are actually defined in the object, regardless of what was required and what wasn't. This allows you to run `schema.validate()` against partial objects. For example:

    p = {
      name: 'MERCMOBILY',
    }

    complexSchema.validate( p, { onlyObjectValues: true }, function( err, newP, errors ){
      // ...
    });


`newP` will be:

    { name: 'MERC' }

Note that only what "was there" was processed (it was cast and had parameters assigned).

### `skip`

If `skip` is true, BOTH casting and validation will be skipped altogether. The callback will be called directly, no validation done. This is useful if you want to turn off validation in your program, but don't want to change the program's flow.

Note that a _copy_ of the object will be passed to the callback (since the same thing would happen if `validate()` was called).

### `skipValidation`

If `skipValidation` is true, casting will happen but validation won't.

### `skipCast`

The option `skipCast` is used when you want to skip casting for specific fields.

    p = {
      name: 'TOny',
      surname: 'MOBILY',
      age: '37',
      id: 3424234424,
      date: '2013-10-10',
      list: [ 'one', 'two', 'three' ]
    }

    complexSchema.validate( p, { skipCast: [ 'age' ] }, function( err, newP, errors ){
      // ...
    });

`newP` will be (note that '37' is still a string):

    { name: 'TONY',
      surname: 'mobily',
      age: '37',
      id: 3424234424,
      date: Thu Oct 10 2013 08:00:00 GMT+0800 (WST),
      list: [ 'one', 'two', 'three' ] },
    }


### `skipParams`

The option `skipParams` is used when you want to decide which parameters you want to skip for which fields.

    p = {
      name: 'Chiara',
      surname: 'MOBILY',
      age: '37',
      id: 3424234424,
      date: '2013-10-10',
      list: [ 'one', 'two', 'three' ]
    }

    complexSchema.validate( p, { skipParams: { name: [ 'uppercase', 'trim' ] } }, function( err, newP, errors ){
      // ...
    });

`newP` will be:

    { name: 'Chiara',
      surname: 'mobily',
      age: 37,
      id: 3424234424,
      date: Thu Oct 10 2013 08:00:00 GMT+0800 (WST),
      list: [ 'one', 'two', 'three' ] },
    }

Note that `name` is still unchanged: it didn't get lowercased, nor trimmed.

### `ignoreFields`

The option `ignoreFields` is used when you want some fields to be completely ignored by SimpleSchema.

    p = {
      name: 'TOny',
      surname: 'MOBILY',
      age: '37',
      id: 3424234424,
      date: '2013-10-10',
      list: [ 'one', 'two', 'three' ],
      spurious: 10,
    }

    complexSchema.validate( p, { ignoreFields: [ 'spurious' ] }, function( err, newP, errors ){
      // ...
    });

`newP` will be:

    { name: 'TONY',
      surname: 'mobily',
      age: 37,
      id: 3424234424,
      date: Thu Oct 10 2013 08:00:00 GMT+0800 (WST),
      list: [ 'one', 'two', 'three' ] },
    }

Note that `spurious` was taken ot of the picture, and that `errors` is be empty (whereas it would normally complain about the extra `spurious` field being there)

### `ignoreFieldsWithAttributes`

The option `ignoreFieldsWithAttributes` is used when you want to ignore all fields that have, in the schema, one of the attributes set to `true`.

    p = {
      name: 'Tony',
      surname: 'MOBILY',
      age: '37',
      id: 3424234424,
      date: '2013-10-10',
      list: [ 'one', 'two', 'three' ],
    }

    complexSchema.validate( p, { ignoreFieldsWithAttributes: [ 'extraParameter' ] }, function( err, newP, errors ){
      // ...
    });

`newP` will be:

    { name: 'TONY',
      surname: 'mobily',
      id: 3424234424,
      date: Thu Oct 10 2013 08:00:00 GMT+0800 (WST),
      list: [ 'one', 'two', 'three' ] },
    }

Note that `age` is out of the picture, because it has `extraParameter` set to true.

### `deserialize`

This option, if set to `true`, will make `serialize` work the opposite way: data will be converted back to Javascript Objects (see explanation above).

## The 'required' parameter is special

All field types and parameters are completely equal as far as `validate()` is concerned -- except one: `required`.

When dealing with `required`, remember that:

1) `validate()` won't attempt to cast an object value if it's `undefined` and `required` is `false`. If `required` weren't special, casting (and therefore validation as a whole) would (erroneously) fail for values that are both optional and missing.

2) If the `required` constraint is not met, then other parameters (`max`, `default`, etc.) will not be applied (obviouly)

3) If you want to safely skip `required` as a parameter, you will also need to turn off casting for that field. If you don't, then casting will possibly fail (as it will try to cast from `undefined`, with possibly strange results). If for example you wanted to override `id`'s schema definition making it optional rather than required, you would run `validate()` this way:

    complexSchema.validate( p, { skipCast: 'id', skipParams: { id: [ 'required' ] } }, function( err, newP, errors ){

## (Per-field) sync and (object-wide) async validation

You can use functions to validate data. There are two cases:

### Per field, sync validation

In the schema, you can define a field as follows:

    age:  { type: 'number', default: 15, min: 10, max: 40, validator: fieldValidatorFunc },

Where `fieldValidatorFunc` is:

    var fieldValidatorFunc =  function( obj, value, fieldName ){
      if( value == 150 ) return 'Age cannot be 150';
      return;
    };

In `fieldValidatorFunc`, the `this` variable is the schema object. If the function returns a string, that will be the error. If it returns nothing, then validation went through.

Note that this validation is synchronous. It's meant to be used to check field sanity.

### Object-wide, async validation

The second parameter of the construction object is a hash. If the `validator` key is set, that function will be used for validation. One bonus of this function is that it's asynchronous. This function is there in cases where you need more complex, asynchronous validation that relies on running asynchronous functions.

For example:

    complexSchema = new Schema({
      name:    { type: 'string', lowercase: true, trim: 30, required: true, notEmpty: true },
      surname: { type: 'string', uppercase: true, trim: 50, required: true, notEmpty: true },
    },
    {
      validator: function( object, originalObject, castObject, options, done ){
        var errors = [];

        db.collection.bannedNames.find( { name: object.name }, function( err, docs ){
          if( err ){
            done( err );
          } else {
            if( docs.length ){
              errors.push( { field: 'name', message: 'Name not valid or not allowed' } );
            }
            done( null, errors );
          }
        });

      }
    });

Note that you have several versions of the object: `object` is the object once all casting and all parameters are applied to it; `originalObject` is the one passed originally to `validate()`; `castObject` is the object with only casting applied to it.

You also have access to the `options` passed when you did run `validate()`. For example, you could do:

    asyncValidatedSchema = new Schema({
      name:    { type: 'string', lowercase: true, trim: 30, required: true, notEmpty: true },
      surname: { type: 'string', uppercase: true, trim: 50, required: true, notEmpty: true },
    },
    {
      validator: function( object, originalObject, castObject, options, done ){
        var errors = [];

        // Check options, skip check if `skipDbCheck` was passed
        if( options.skipDbCheck ){ return done( null, [] ) }

        db.collection.bannedNames.find( { name: object.name }, function( err, docs ){
          if( err ){
            done( err );
          } else {
            if( docs.length ){
              errors.push( { field: 'name', message: 'Name not valid or not allowed' } );
            }
            done( null, errors );
          }
        });

      }
    });

    var p = { name: 'Tony', surname: 'Mobily' };

    asyncValidatedSchema.validate( p, { skipDbCheck: true }, function( err, newP, errors ){
      if( err ){
        console.log('Callback failed:");
        console.log( err );
      } else {
        console.log("Validation errors:");
        console.log( errors );
    });

#### For the curious minds

`validate()` actually works in two phases:

  * Runs `_cast()` to cast object values to the right type. Casting is actually delegated to _casting functions_ (for example, `booleanTypeCast()` for the type `boolean`). `_cast()` will take into account the options `onlyObjectValues` (which will make `_cast()` only work on fields that actually already exist in the object to be cast, allowing you to cast partial objects), `skipCast` (an array of fields for which casting will be skipped), `ignoreFields` and `ignoreFieldsWithAttributes` (instructs which fields are to be ignored altogether).

  * Runs `_params()` to apply schema parameters to the corresponding object fields. Just like `_cast()`, this function simply delegates all functionalities to the _schema params functions_ (for example, `uppercaseTypeParam()`). `_params()` will take into account of the options `onlyObjectValues` (applying parameters only to fields that already exist in the object), `skipParams` (which allows you to decide what parameters should _not_ be applied to specific fields), `ignoreFields` and `ignoreFieldsWithAttributes` (instructs which fields are to be ignored altogether).

## Extending a schema

The basic schema is there to be extended. It's very easy to define new types (casting) and new parameters (field manipulation): all you need to do is create a new constructor that inherits from Schema, and add appropriately named methods.

The easiest way to extend a schema is by using [SimpleDeclare - Github](https://github.com/mercmobily/simpleDeclare).

For example:

    var Schema = require( 'simpleschema' );
    var NewSchema = declare( Schema, {

      incrementByTypeParam: function( p ){
        if( typeof( p.value ) !== 'number' ) return; // Only works with numbers
        return p.value = p.value + p.parameterValue;
      },

      booleanTypeCast: function( definition, value, fieldName, failedCasts ){
        return !!value;
      },
    });

Now in your schema you can have entries like:

    age:     { type: 'number', incrementBy: 10 },
    enabled: { type: 'boolean' },

You can also create new schema without using SimpleDeclare, but the good old nodejs way:

    var Schema = require( 'simpleschema' );

    function NewSchema( structure, options ){
      Schema.apply( this, arguments );
    }
    require('util').inherits( NewSchema, Schema );

    NewSchema.prototype.incrementByTypeParam = function( p ){
      if( typeof( p.value ) !== 'number' ) return; // Only works with numbers
      return p.value = p.value + p.parameterValue;
    }
    NewSchema.prototype.booleanTypeCast = function( definition, value, fieldName, failedCasts ){
      return !!value;
    }

I cannot really write this code without a cringing feeling in my stomach. But, it's up to you.

### Extending types

Types are defined by casting functions. When `validate()` encounters:

    surname: { type: 'string', lowercase: true },

It looks into the schema for a function called `stringTypeCast`. It finds it, so it runs:

    stringTypeCast: function( definition, value, fieldName, options, failedCasts ){

      // Undefined: return '';
      if( typeof( value ) === 'undefined' ) return '';

      // No toString() available: failing to cast
      if( typeof( value.toString ) === 'undefined' ){
        failedCasts[ fieldName ] = true;
        return;
      }

      // Return cast value
      return value.toString();
    },

Note that the casting function must:

* EITHER return the cast value
* OR return nothing, and add an entry to the failedCasts hash

The parameters passed to the function are:

* `definition`. The full definition for that field. For example, `{ type: 'string', lowercase: true }`
* `value`. The value of the record for that field
* `fieldName`. The field's name
*  `options`: Options passed to the `validate()` function
* `failedCasts`. A hash variable, that needs to be "enriched" if a cast fails (see above)

### Extending parameters

Parameters are based on the same principle. So, when `validate()` encounters:

    surname: { type: 'string', lowercase: true },

it will look for `this.lowercaseTypeParam()`, which is:

    lowercaseTypeParam: function( p ){
      if( typeof( p.value ) !== 'string' ) return;
      return  p.value.toLowerCase();
    },

Note that the checking function must:

* EITHER return the new value (which will replace the old one)
* OR return nothing (the original value won't be changed)

The `p` parameter is a hash with the following values:

 *  `value`: The value of that field for the passed object. Note that parameters are applied sequentially. So, if you have a field defined as `{ type: 'string', trim: 10, uppercase: true }`, by the time `uppercase` is applied, `value` will already be trimmed.
 *  `valueBeforeParams`: The value of that field before _any_ parameters were applied
 *  `object`: The full passed object. The same concept of parameters applied sequentially applies.
 *  `objectBeforeCast`: The full object before casting was applied
 *  `objectBeforeParams`: The full object before _any_ params were applied.
 *  `fieldName`: The field's name
 *  `definition`: The full definition for that schema field (`{ type: 'number', incrementBy: 10 }`)
 *  `parameterName`: The name of this particular parameter in the definition. For example, for `{ default: 'some', max: 10 }` while processing `max`, `parameter` will be `max`.
 *  `parameterValue`: The value for this particular parameter in the definition (for example, for `max` it would be `10`).
 *  `errors`: The errors array that will be "augmented" with errors if necessary (new errors will need to be `push()`ed
 *  `options`: Options passed to the `validate()` function

# API description

This is the full list of functions available with this module:

## `constructor()`

Make up the schema object, assigning the `this.structure` field.

Parameters:

  * `schemaObject` The schema structure
  * `options` An optional `options` object which can have:
    * `validator` -- The validator function
    * (that's it for now)

## `xxxTypeCast( definition, value, fieldName, options, failedCasts )`

Helper function that will define the type `xxx`. Used when you have, in your schema, something like `field1: { type: 'xxx' }`

# `xxxTypeParam( p )`

Helper function to define possible parameters (other than "type"). Note that a parameter can apply to _any_ type -- it's up to the parameter helper function to decide what to do.

## `validate( object, options, callback)`

Applies schema casting and parameters to the passed object.

Parameters:

  * `object`. The object to cast and check
  * `options`. Options received by all param and casting functions
  * `callback`. The callback to call once validation is done

## `cleanup()`

Clean up fields with a specific parameter defined.

Parameters:

  * `object` The object to cleanup
  * `parameterName` The name of the parameter that will be hunted down. Any field that in the schema structure has thar parameter fill be deleted from `object`

## `makeId()`

Function that returns a generated unique ID. It could be `ObjectId()` (mongoDB) or a new SEQUENCE number (MariaDB). Specific drivers will tend to rewrite this function.

Parameters:

  * `object` The object for which the unique ID will be created
  * `cb` The callback to call once the ID is created

NOTE: the `makeId()` function is likely to be overridden by driver-specific ones.

## "Class" (or "constructor function") functions

The "Class" itself has the method `makeId()` available. They are useful as "Class" functions as they might get used by an application while _creating_ an object.

# Driver-specific Mixins

SimpleSchema comes with pre-defined mixins that allow you to extend the type and parameters available to SimpleSchema.

## MongoSchemaMixin

MongoSchemaMixin is available from [SimpleSchema-MongoDb](https://github.com/mercmobily/simpleschema-mongodb). When you use MongoSchemaMixin:

* The type `id` will be a proper MondoDb ObjectId object
* The object _and_ class function `makeId()` will return a new MongoDb ObjectId object
