    var declare = require('simpledeclare'); // Declare module

    var dbSpecific = require('./dbSpecific-tingo.js');

    exports = module.exports = function( app ){

      var JRS = dbSpecific.JRS;
      var Schema = dbSpecific.Schema;
    
      // People, defined with the shorthand way
      var People = declare( JRS, {
    
        schema: new Schema({
          name   : { type: 'string', trim: 60 },
          surname: { type: 'string', trim: 60 },
        }),
    
        storeName: 'People',
        publicURL: '/people/:id',
    
        handlePut: true,
        handlePost: true,
        handleGet: true,
        handleGetQuery: true,
        handleDelete: true,
    
        hardLimitOnQueries: 50,
      });
    
      People.onlineAll( app );

      // Managers, with paramIds and schema IDs defined manually
      var Managers = declare( JRS, {
    
        schema: new Schema({
          id     : { type: 'id', required: true },
          name   : { type: 'string', trim: 60 },
          surname: { type: 'string', trim: 60 },
        }),
    
        paramIds: [ 'id' ],
        storeName: 'Managers',
    
        handlePut: true,
        handlePost: true,
        handleGet: true,
        handleGetQuery: true,
        handleDelete: true,
    
        hardLimitOnQueries: 50,
      });
    
      Managers.onlineAll( app, '/managers/:id' ); // You need the URL here
 

    }
