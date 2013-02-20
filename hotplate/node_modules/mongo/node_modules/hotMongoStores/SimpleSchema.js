var 
  dummy
, hotplate =  require('hotplate')
;


var SimpleSchema = function( structure, options ){
  this.structure = structure;
  this.options = typeof( options ) !== 'undefined' ? options : {};
  this.cameEmpty = {};
}

SimpleSchema.prototype.cast = function( object ){

/*
    schema: {
      longName: { type: 'string', required: true, notEmpty: true, trim: 35 },
      tag     : { type: 'number', notEmpty: true, max: 30 },
      _id     : { type: 'id', required: true },
      _tabId  : { type: 'id', doNotSave: true },
    }
  */

  var type;

  // Scan passed object
  for( var k in object ){

      definition = this.structure[ k ];

      if( typeof(definition) === 'undefined' ) return;

      // Set the internal hash this.cameEmpty if the field arrived empty
      // This will then be used later at checking time
      // Note: arrays are a special case: it's an array if multiple fields have 
      // the same `name` attribute. Arrays are not checked.
      if( ! Array.isArray( object[ k ] ) && object[ k ] == '' ) this.cameEmpty[ k ] = true;

      switch(definition.type){

        case 'string':
          object[ k ] = object[ k ].toString();
          // Trim it if necessary. Since there is no chanche of adding an error,
          // I consider this part of casting
          if( definition.trim ) object[ k ] = object[ k ].substr( 0, definition.trim );
          if( definition.lowercase) object[ k ] = object[ k ].toLowerCase();
          if( definition.uppercase) object[ k ] = object[ k ].toLowerCase();
        break;
   
        case 'number':
          object[ k ] = Number( object[k] );
        break;

        case 'date':
          object[ k ] = new Date( object[ k ] );
        break;

        case 'id':
        break;

        case 'array':
          if( ! Array.isArray( object[ k ] ) ){
             // Turn into an Array with 1 value: the original object
             object[ k ] = [ object[ k ] ];
          }
        break;


      }
 
  }
  
}

SimpleSchema.prototype.check = function( object, errors, options ){

/*
    schema: {
      longName: { type: 'string', required: true, notEmpty: true, trim: 35 },
      tag     : { type: 'number', notEmpty: true, max: 30 },
      _id     : { type: 'id', required: true },
      _tabId  : { type: 'id', doNotSave: true },
    }
  */

  var type;

  var options = typeof(options) === 'undefined' ? {} : options;

  if( ! Array.isArray( errors ) ) errors = [];

  // Use the global validator first
  if( typeof( this.options.validator) !== 'undefined' ){
    this.options.validator.call( this, object, errors );
  }
  
  // Scan schema
  for( var k in this.structure[ k ] ){
    definition = this.structure[ k ];
   
    // Check that all "required" fields are there
    if( definition.required && typeof( object[ k ]) === 'undefined'){
      if( Array.isArray( options.notRequired )  && !( k in options.notRequired ) ){
        errors.push( { field: k, message: 'Field required:' + k, mustChange: true } );
      }
    }
  }


  // Scan passed object
  for( var k in object ){

    // First of all, if it's not in the schema, it's not allowed
    if( typeof( this.structure[ k ] ) === 'undefined' ){
      errors.push( { field: k, message: 'Field not allowed: ' + k, mustChange: false } );
    } else {

      // Get the value type
      definition = this.structure[ k ];

      // Check if the value was empty when it was submitted and it shouldn't have been
      if( definition.notEmpty && this.cameEmpty[ k ] ){
          errors.push( { field: k, message: 'Field cannot be empty: ' + k, mustChange: true } );
      }

      // Apply fieldValidators
      if( typeof( definition.fieldValidator) !== 'undefined' ){
        var msg = definition.fieldValidator( false );
        if( ! definition.fieldValidator( object[ k ] ) )
          errors.push( { field: k, message: msg, mustChange: true } );
      }

      switch(definition.type){

        case 'string':
        break;
   
        case 'number':
          // Check its range
          if( typeof( definition.max ) !== 'undefined'  && object[k] > definition.max )
            errors.push( { field: k, message: 'Field is too high: ' + k, mustChange: true } );
          if( typeof( definition.min ) !== 'undefined'  && object[k] < definition.min )
            errors.push( { field: k, message: 'Field is too low: ' + k, mustChange: true } );
        break;

        case 'date':
        break;

        case 'id':
          if( ! checkObjectId( object[ k ] ) )
            errors.push( { field: k, message: 'Invalid ID: ' + k, mustChange: false } );
        break;

        case 'array':
        break;
      }
        

    }
 
  }
  
}


SimpleSchema.prototype.cleanUp = function( object ){
  newObject = {};
  for( var k in object )
     if( ! this.schema.structure[ k ].doNotSave )
        newObject[ k ] = object[ k ];
  return newObject;
}




