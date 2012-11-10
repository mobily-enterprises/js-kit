/**
 * Module dependencies.
 */
var dummy
 , mongoose = require('mongoose')
 , Schema = mongoose.Schema
 , ObjectId = Schema.ObjectId
 , util = require('util')
;



// Connect to DB
mongoose.connect('mongodb://localhost/hotplateTest');

var AccessSchema = new Schema({
  userId         : { type: ObjectId, index: true },
  token          : { type: String, index: true },
  isOwner        : { type: Boolean, index: true },
  details        : { name: String, surname: String},
})
mongoose.model('Access', AccessSchema);

var WorkspaceSchema = new Schema({
  name           : { type: String, lowercase: true, unique: true},
  description    : String,
  isActive       : Boolean,
  access          : [ AccessSchema ],
});
mongoose.model('Workspace', WorkspaceSchema);

//console.log("Workspace Schema:\n%s", util.inspect(AccessSchema));
//console.log("Workspace Schema:\n%s", util.inspect(   mongoose.model('Workspace')  ));
//console.log('Schema type "name": ', util.inspect( AccessSchema.path('token') ) );

Workspace = mongoose.model('Workspace');
//console.log('Model: %s', Workspace);

w = new Workspace();

for(var property in w){
  console.log('There is: %s', property);
}

console.log('wii: %s', util.inspect(w) );
console.log('R %s', w.isNew );
w.name = 'Chiara';
w.save();



Workspace.find({}, function(err, docs){
  docs.forEach( function(item){
    item.toObject = undefined; 
    console.log("ITEM: %j", item );
    
    //for(var property in item){
    //  console.log('There is: %s', property);
    //}
  });

});

