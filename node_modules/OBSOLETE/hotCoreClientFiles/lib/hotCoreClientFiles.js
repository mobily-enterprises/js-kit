"use strict";


/*!
 * Module dependencies.
 */

var dummy
  , hotplate = require('hotplate')
  , path = require('path')
  , send = require('send')
  , e = require('allhttperrors')
;


hotplate.config.set('hotCoreClientFiles.renderExtensions',  { '.jade': true } );

var getLocalLocations = hotplate.cacheable( function( done ){

  var moduleName;
  var localLocations = {};

  hotplate.hotEvents.emitCollect( 'clientPath', function( err, results ){
    results.forEach( function( element ) {
      localLocations[ element.module ] = element.result;
    });

    done( null, localLocations );
  });
});


var getRenderList = hotplate.cacheable( function( done ){

  var moduleName;
  var renderList = {};

  hotplate.hotEvents.emitCollect( 'clientPathRender', function( err, results ){
    results.forEach( function( element ) {
      moduleName = element.module;

      element.result.forEach( function( toRender ){
        if( ! renderList[ moduleName ] ) renderList[ moduleName ] = {};
        for( var k in toRender ){
          renderList[ moduleName ][ k ] = toRender[ k ];
        }
      });
    });

    done( null, renderList );
  });
});


/**
  Returns a function that will serve files that are set as
  public by other modules by implementing the `clientPaths` hook

  This function is a mixture of:
    * express/node_modules/connect/lib/middleware
    * express/lib/application.js#app.render

  @method serve
  @param options
*/
exports.serve = function( app, options ){

  options = options || {};

  // Make up the regular expression to check if the URL requested in
  // one of the URLs monitored by the module
  var moduleFilesPrefixRegExp = new RegExp('^' + hotplate.config.get('hotplate.moduleFilesPrefix') + '/(.*?)/(.*)');

  // Return the actual route
  return function(req, res, next) {

    // If there is a match between the request and the
    // expected sub-url...
    var  match = req.path.match( moduleFilesPrefixRegExp );

    getLocalLocations( function( err, localLocations ){
      if( err ) return next( err );

      getRenderList( function( err, renderList ){
        if( err ) return next( err );

        if( match && localLocations[ match[1] ] ){

          // Create the variable names
          var moduleName = match[1];
          var fileLocation = match[2];

          // Get the "local" variable for that module
          var localDir = localLocations[ moduleName ];

          // At this point, if:
          //  - req.path      is /hotPlateDir/testingModule/css/one.css
          //  - moduleFilesPrefix is /hotPlateDir
          //
          // Then:
          //  - moduleName   would be  testingModule
          //  - localDir     would be  /home/www/program/node_modules/testingModule/public_files/
          //  - fileLocation would be  css/one.css

          // CASE #1: File needs to be rendered!

          if( renderList[ moduleName ] && typeof( renderList[ moduleName ][ fileLocation ] ) === 'object' ){

            var renderOpts = renderList[ moduleName ][ fileLocation ];

            var opts = {};

            // Copy over app's locals and render opts (taken from renderList)
            for( var key in app.locals ) opts[ key ] = app.locals[ key ];
            for( var key in renderOpts ) opts[ key ] = renderOpts[ key ];

            opts.name = new Date();

            // Make up the view
            var view = new (app.get('view'))(fileLocation, {
              defaultEngine: app.get('view engine'),
              root: localDir,
              engines: app.engines
            });

            // If the view was found (path is there), then render it
            // using the right options
            if( ! view.path ){
              next( new e.NotFoundError() );
            } else {
              view.render( opts, function( err, html ){
                if( err ){
                  next( err );
                } else {
                  res.send( html );
                }
              });

            }

          // CASE #2: No rendering required, send and that's it
          } else {

            var error = function error( err ) {
              if( 404 == err.status) return next();
              next(err);
            }

            // Send it!
            send(req, fileLocation, {  maxage: options.maxAge || 0, root: localDir } )
              .on('error', error )
              .pipe( res );
          }

        } else {
          return next();
        }

      })

    });





  }

};
