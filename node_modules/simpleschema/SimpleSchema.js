/*
Copyright (C) 2013 Tony Mobily

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var
  dummy
, declare = require('simpledeclare')
;

var SimpleSchema = declare( Object, {

  constructor: function( structure, options){
    this.structure = structure;
    this.options = typeof( options ) !== 'undefined' ? options : {};
  },


  // Built-in types

  noneTypeCast: function( definition, value, fieldName, options, failedCasts ){
   return value;
  },

  stringTypeCast: function( definition, value, fieldName, options, failedCasts ){

    // Undefined: return '';
    if( typeof( value ) === 'undefined' ) return '';
    if( value === null ) return '';

    // No toString() available: failing to cast
    if( typeof( value.toString ) === 'undefined' ){
      failedCasts[ fieldName ] = true;
      return;
    }

    // Return cast value
    return value.toString();
  },

  blobTypeCast: function( definition, value, fieldName, options, failedCasts ){

    // Undefined: return '';
    if( typeof( value ) === 'undefined' ) return '';
    if( value === null ) return '';

    return value;
  },

  numberTypeCast: function( definition, value,  fieldName, options, failedCasts ){

    // Undefined: return 0;
    if( typeof( value ) === 'undefined' ) return 0;

    // If Number() returns NaN, fail
    var r = Number( value );
    if( isNaN( r ) ){
      failedCasts[ fieldName ] = true;
      return;
    }

    // Return cast value
    return r;

  },

  dateTypeCast:function( definition, value, fieldName, options, failedCasts ){

    // Undefined: return a new date object
    if( typeof( value ) === 'undefined' ){
      return new Date();
    }

    // If new Date() returns NaN, date was not corect, fail
    var r = new Date( value );
    if( isNaN( r ) ){
      failedCasts[ fieldName ] = true;
      return value;
    }

    // return cast value
    return r;

  },

  arrayTypeCast: function( definition, value, fieldName, options, failedCasts){
    return Array.isArray( value ) ? value : [ value ];
  },


  geoTypeCast: function( definition, value, fieldName, options, failedCasts){

    var r = value;

    if( typeof( r ) === 'string' ){
      try {
          // Attempt to stringify
          r = JSON.parse( r );

      } catch( e ){
        failedCasts[ fieldName ] = true;
        return value;
      }
    }

    // Force the type to be the geoType regardless of what was passed
    r.type = definition.geoType;

    // Basically the only allowed key is `coordinates`
    if( Object.keys( r ).length != 2 ){
      failedCasts[ fieldName ] = true;
      return value;
    }

    // There must be a `coordinates` element, and it needs to be an array
    if( ! Array.isArray( r.coordinates ) ){
      failedCasts[ fieldName ] = true;
      return value;
    }

    // It's "point" by default
    definition.geoType = definition.geoType || 'Point';

    switch( definition.geoType ){
      case 'Point':
        // Every coordinate needs to be a number
        if( r.coordinates.length != 2 || ! r.coordinates.every( function( i ){ return typeof( i ) === 'number' } ) ){
          failedCasts[ fieldName ] = true;
          return value;
        }
      break;

      default:
        throw( new Error("Invalid geoType: " + definition.geoType ) );
      break;
    }

    // If it's taking data out, add the type to whatever was taken out
    if( options.deserialize ){
      r.type = definition.geoType;
    }

    // R is good and valid
    return r;
  },


  serializeTypeCast: function( definition, value, fieldName, options, failedCasts ){

    var r;

    if( options.deserialize ){

      if( typeof( value ) !== 'string' ){
        failedCasts[ fieldName ] = true;
        return value;
      }

    // CASE #1: it's a string. Serialise it
    //if( typeof( value ) === 'string' ){

      try {
          // Attempt to stringify
          r = JSON.parse( value );

          // It worked: return r
          return r;
      } catch( e ){
        failedCasts[ fieldName ] = true;
        return value;
      }

    // CASE #2: it's anything but a string. Serialise it.
    } else {

      if( typeof( value ) !== 'object' ){
        failedCasts[ fieldName ] = true;
        return value;
      }

      try {
          // Attempt to stringify
          r = JSON.stringify( value );

          // It worked: return r
          return r;
      } catch( e ){
        failedCasts[ fieldName ] = true;
        return value;
      }

    //
    }
  },

  // Cast an ID for this particular engine. If the object is in invalid format, it won't
  // get cast, and as a result check will fail
  booleanTypeCast: function( definition, value,  fieldName, options, failedCasts ){
    return !!value;
  },

  // Cast an ID for this particular engine. If the object is in invalid format, it won't
  // get cast, and as a result check will fail
  idTypeCast: function( definition, value,  fieldName, options, failedCasts ){
    var n = parseInt( value );
    if( isNaN( n ) ){
      failedCasts[ fieldName ] = true;
      return value;
    } else {
      return n;
    }
  },


  // Built-in parameters

  minTypeParam: function( p ){

    if( p.definition.type === 'number' && p.value && p.value < p.parameterValue ){
      p.errors.push( { field: p.fieldName, message: 'Field is too low: ' + p.fieldName } );
    }
    if( p.definition.type === 'string' && p.value && p.value.length < p.parameterValue ){
      p.errors.push( { field: p.fieldName, message: 'Field is too short: ' + p.fieldName } );
    }
  },

  maxTypeParam: function( p ){
    if( p.definition.type === 'number' && p.value && p.value > p.parameterValue ){
      p.errors.push( { field: p.fieldName, message: 'Field is too high: ' + p.fieldName } );
    }

    if( p.definition.type === 'string' && p.value && p.value.length > p.parameterValue ){
      p.errors.push( { field: p.fieldName, message: 'Field is too long: ' + p.fieldName } );
    }

  },

  validatorTypeParam: function( p ){
    if( typeof( p.parameterValue ) !== 'function' )
      throw( new Error("Validator function needs to be a function, found: " + typeof( p.parameterValue ) ) );

    var r = p.parameterValue.call( this, p.object, p.object[ p.fieldName ], p.fieldName );
    if( typeof( r ) === 'string' ) p.errors.push( { field: p.fieldName, message: r } );
  },

  uppercaseTypeParam: function( p ){
    if( typeof( p.value ) !== 'string' ) return;
    return  p.value.toUpperCase();
  },
  lowercaseTypeParam: function( p ){
    if( typeof( p.value ) !== 'string' ) return;
    return  p.value.toLowerCase();
  },

  trimTypeParam: function( p ){
    if( typeof( p.value ) !== 'string' ) return;
    return  p.value.substr( 0, p.parameterValue );
  },

  defaultTypeParam: function( p ){
    var v;
    if( typeof( p.objectBeforeCast[ p.fieldName ] ) === 'undefined' ){
      if( typeof(  p.parameterValue ) === 'function' ){
        v = p.parameterValue.call();
      } else {
        v = p.parameterValue;
      }
      p.object[ p.fieldName ] = v;
    }
  },


  requiredTypeParam: function( p ){
    if( typeof( p.objectBeforeCast[ p.fieldName ]) === 'undefined'  && p.parameterValue ){
      p.errors.push( { field: p.fieldName, message: 'Field required: ' + p.fieldName } );
    }
  },

  notEmptyTypeParam: function( p ){

    // if( ! Array.isArray( p.value ) && ( typeof( p.objectBeforeCast[ p.fieldName ]) === 'undefined' || p.objectBeforeCast[ p.fieldName ] == '')) {
//    if( ! Array.isArray( p.value ) &&  p.objectBeforeCast[ p.fieldName ] == '' && p.parameterValue) {
    var bc = p.objectBeforeCast[ p.fieldName ];
    var bcs = typeof( bc ) !== 'undefined' && bc !== null && bc.toString ? bc.toString() : '';
    if( ! Array.isArray( p.value ) &&  typeof( bc ) !== 'undefined' && bcs === '' && p.parameterValue) {
      p.errors.push( { field: p.fieldName, message: 'Field cannot be empty: ' + p.fieldName } );
    }
  },



  // Options and values used:
  //  * options.onlyObjectValues              -- Will apply cast for existing object's keys rather than the
  //                                             schema itself
  //  * options.skipCast                      -- To know what casts need to be skipped
  //
  //  * this.structure[ fieldName ].required  -- To skip cast if it's `undefined` and it's NOT required
  //  //* this.structure[ fieldName ].protected -- To skip cast if it's `undefined` and it's protected
  //
  _cast: function( object, options, cb ){

    var type, failedCasts = {}, failedRequired = {};
    options = typeof( options ) === 'undefined' ? {} : options;
    var targetObject;
    var resultObject = {};

    // Set the targetObject. If the target is the object itself,
    // then missing fields won't be a problem
    if( options.onlyObjectValues ) targetObject = object;
    else targetObject = this.structure;

    var ignoreFields = options.ignoreFields || [];
    var ignoreFieldsWithAttributes = options.ignoreFieldsWithAttributes || [];

    for( var fieldName in targetObject ){

      // Getting the definition
      definition = this.structure[ fieldName ];

      // The field is ignored: skip check
      if( ignoreFields.indexOf( fieldName ) !== -1  ) continue;

      // Check if the field is to be ignored due to a field having a
      // (truly) attribute listed in ignoreFieldsWithAttributes
      var ignored = false;
      ignoreFieldsWithAttributes.forEach( function( attribute ){
        if( definition[ attribute ] ) ignored = true;
      });
      if( ignored ) continue;

      // Copying the value over
      if( typeof( object[ fieldName ] ) !== 'undefined' ) resultObject[ fieldName ] = object[ fieldName ] ;

      // If the definition is undefined, and it's an object-values only check,
      // then the missing definition mustn't be a problem.
      if( typeof( definition ) === 'undefined' && options.onlyObjectValues ) continue;

      // Skip casting if so required by the skipCast array
      if( Array.isArray( options.skipCast )  && options.skipCast.indexOf( fieldName ) != -1  ){
        continue;
      }

      // Skip casting if value is `undefined` AND it's not required
      if( !definition.required && typeof( object[ fieldName ] ) === 'undefined' ){
        continue;
      }

      // Skip casting if value is `undefined` and it's "protected"
      // == NOTE: TODO: Not sure we need this just yet===
      //if( definition.protected && typeof( object[ fieldName ] ) === 'undefined' ){
      //  continue;
      //}

      // Skip casting if value is `undefined` AND it IS required
      // Also, set failedRequired for that field, so that no param will be applied to it except `required`
      if( definition.required && typeof( object[ fieldName ] ) === 'undefined' ){
        failedRequired[ fieldName ] = true;
        continue;
      }

      // Run the xxxTypeCast function for a specific type
      if( typeof( this[ definition.type + 'TypeCast' ]) === 'function' ){
        var result = this[ definition.type + 'TypeCast' ].call( this, definition, object[ fieldName ], fieldName, options, failedCasts );
        if( typeof( result ) !== 'undefined' ) resultObject[ fieldName ] = result;

      } else {
        throw( new Error("No casting function found, type probably wrong: " + definition.type ) );
      }

    }

    // That's it -- return resulting Object
    cb( null, resultObject, failedCasts, failedRequired );

  },

  // Options and values used:
  //  * options.onlyObjectValues             -- Will skip appling parameters if undefined and
  //                                            options.onlyObjectValues is true
  //  * options.skipParams                   -- Won't apply specific params for specific fields
  //  * options.

  _params: function( object, objectBeforeCast, options, failedCasts, failedRequired, cb ){

    var type;
    var options = typeof(options) === 'undefined' ? {} : options;

    var errors = [];
    var resultObject = {}

    // First of all, if it's not in the schema, it's not allowed
    var ignoreFields = options.ignoreFields || [];
    var ignoreFieldsWithAttributes = options.ignoreFieldsWithAttributes || [];

    for( var k in objectBeforeCast ){

      // The field is ignored: skip check
      if( ignoreFields.indexOf( k ) !== -1  ) continue;

      if( typeof( this.structure[ k ] ) === 'undefined' ){
        errors.push( { field: k, message: 'Field not allowed: ' + k } );
      }
    }

    // Copying object into resultObject
    for( k in object ){
      if( typeof( object[ k ]) !== 'undefined' ) resultObject[ k ] = object[ k ];
    }

    // Scan schema
    for( var fieldName in this.structure ){

      // Field is to be ignored: skip everything
      if( ignoreFields.indexOf( k ) !== -1  ) continue;

      // Check if the field is to be ignored due to a field having a
      // (truly) attribute listed in ignoreFieldsWithAttributes
      var definition = this.structure[ fieldName ];
      var ignored = false;
      ignoreFieldsWithAttributes.forEach( function( attribute ){
        if( definition[ attribute ] ) ignored = true;
      })
      if( ignored ) continue;

      // The `onlyObjectValues` option is on: skip anything that is not in the object
      if( options.onlyObjectValues && typeof( object[ fieldName ] ) === 'undefined' ) continue;

      if( ! failedCasts[ fieldName ] ) {
        definition = this.structure[ fieldName ];

         // Run specific functions based on the passed options
        for( var parameterName in definition ){

          // If it's to be skipped, we shall skip -- e.g. `options.skipParams == { tabId: 'required' }` to
          // skip `required` parameter for `tabId` field
          if( typeof( options.skipParams ) === 'object' && options.skipParams !== null ){
            var skipParams = options.skipParams[ fieldName ];
            if( Array.isArray( skipParams ) && skipParams.indexOf( parameterName) !== -1  ) continue;
          }

          if( parameterName != 'type' && typeof( this[ parameterName + 'TypeParam' ]) === 'function' ){

            // If `required` failed during casting, then skip other parameters --
            // `required` is the ONLY parameter that will actually get called
            if( !( failedRequired[ fieldName] && parameterName !== 'required' ) ){

              // Store the length of errors; later, it will use this to check that it hasn't grown
              var errLength = errors.length;

              var result = this[ parameterName + 'TypeParam' ].call( this, {
                value: resultObject[ fieldName ],
                valueBeforeParams: object[ fieldName ],
                object: resultObject,
                objectBeforeCast: objectBeforeCast,
                objectBeforeParams: object,
                fieldName: fieldName,
                definition: definition,
                parameterName: parameterName,
                parameterValue: definition[ parameterName ],
                errors: errors,
                options: options,
              } );

              if( typeof( result ) !== 'undefined' ) resultObject[ fieldName ] = result;

              // If `errors` grew, the following parameters will not be applied
              if( errors.length != errLength ) break;
            }

          }
        }
      }
    }
    cb( null, resultObject, errors );

  },

  _validate: function( finalObject, originalObject, castObject, options, cb ){

    if( typeof( this.options ) === 'object'  && typeof( this.options.validator) === 'function' ){
      this.options.validator.call( this, finalObject, originalObject, castObject, options, cb );
    } else {
      cb( null, [] );
    }
  },

  // Options and values used (the ones used by _cast() and _params() together)
  //
  //  * options.onlyObjectValues             -- Will apply cast for existing object's keys rather than the schema itself
  //  * options.skipCast                     -- To know what casts need to be skipped
  //  * options.skipParams                   -- Won't apply specific params for specific fields
  //
  //  * this.structure[ fieldName ].required -- To skip cast if it's `undefined` and it's NOT required
  //
  // Note that the only special parameter is 'required' -- it's only special because _cast() won't cast
  // it if it's `undefined` and it's not required. Otherwise, casting will make validation fail for unrequired and absent values
  //
  // This will run _cast, _param and _validate
  validate: function( originalObject, options, cb ){

    var self = this;

    if( typeof( cb ) === 'undefined' ){
      cb = options;
      options = {};
    }

    options = typeof( options ) === 'undefined' ? {} : options;

    // If `option.skipValidation` is set, then validation is actually skipped,
    // an exact copy of `originalObject` is provided instead.
    // This provides an easy way, for callers, to have validation as an option easily
    // (they still call `validate()`, it just doesn't do anything)
    if( options.skip ){
      var t = {};
      for( var k in originalObject ) t[ k ] = originalObject[ k ];
      return cb( null, t, [] );
    }

    self._cast( originalObject, options, function( err, castObject, failedCasts, failedRequired ){

      if( err ) return cb( err );

      self._params( castObject, originalObject, options, failedCasts, failedRequired, function( err, paramObject, errors ){
        if( err ) return cb( err );

        Object.keys( failedCasts ).forEach( function( fieldName ){
          errors.push( { field: fieldName, message: "Error during casting" } );
        });

        // If validation is to be skipped, the function ends here. Only casts were done!
        if( options.skipValidation ){
          return cb( null, paramObject, errors );
        }

        self._validate( paramObject, originalObject, castObject, options, function( err, validateErrors ) {
          if( err ) return cb( err );

          if( Array.isArray( validateErrors ) ){
            cb( null, paramObject, Array.prototype.concat( errors, validateErrors ) );
          } else {

            cb( null, paramObject, errors );
          }

        });
      });

    });

  },


  cleanup: function( object, parameterName ){
    newObject = {};
    for( var k in object ){
       //if( ! this.structure[ k ] ) throw( new Error("FATAL: attempted to deal with field " + k + " which is not in the schema"));
       if( ! this.structure[ k ] ) continue;
       if( this.structure[ k ][parameterName] ) {
         delete object [ k ];
         newObject[ k ] = object[ k ];
       }
    }
    return newObject;
  },


  // The default id maker (just return a random number )
  // available as an object method
  makeId: function( object, cb ){
    SimpleSchema.makeId( object, cb );
  },

});


SimpleSchema.makeId = function( object, cb ){
  cb( null, Math.floor(Math.random()*10000000) );
},


exports = module.exports = SimpleSchema;
