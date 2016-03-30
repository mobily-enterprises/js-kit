    /**
     * Module dependencies.
     */

    var express = require('express');
    var routes = require('./routes');
    var user = require('./routes/user');
    var http = require('http');
    var path = require('path');

    var dbSpecific = require('./dbSpecific-tingo.js'); // ADDED
    var storesRoutes = require('./storesRoutes.js'); // ADDED
   
    var app = express();
    
    // ADDED 10 lines:
    // The whole app will be wrapped around the connecton
    // dbSpecific.connect( 'mongodb://localhost/tests', {}, function( err ){
    dbSpecific.connect( '/tmp/tests', {}, function( err ){
      if( err ){
        console.error("Could not connect to the database server");
        process.exit(1);
      } else {
        // From this point on, dbConnect.db will be available to anybody
        // requiring `dbConnect.js`

        // all environments
        app.set('port', process.env.PORT || 3000);
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');
        app.use(express.favicon());
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
        app.use(express.static(path.join(__dirname, 'public')));
    
        // Set JsonRestStore routes for REST stores
        storesRoutes( app ); // ADDED
    
        // development only
        if ('development' == app.get('env')) {
          app.use(express.errorHandler());
        } 

        app.get('/', routes.index);
        app.get('/users', user.list);

        http.createServer(app).listen(app.get('port'), function(){
          console.log('Express server listening on port ' + app.get('port'));
        });
      }
    });

