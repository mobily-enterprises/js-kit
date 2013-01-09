var  mongoose = require('mongoose')


var Schema = require('mongoose').Schema,
    childSchema = new Schema ({ 
      property1: { type: String, required: true } 
    }), 
    parentSchema = new Schema ({ 
      child: [childSchema] 
    }); 

// Add another property to child schema after parentSchema is defined: 

console.log( require('util').inspect(childSchema, true, 3));
parentSchema.path('child').schema.add({ 
  property2: { type: String, required: true } 
});

console.log('---------------------');
console.log( require('util').inspect(childSchema, true, 3));
