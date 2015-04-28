"use strict";

/*!
 * Module dependencies.
 */

var dummy
  , hotplate = require('hotplate')
  , path = require('path')
;


hotplate.hotEvents.onCollect( 'pageElements', 'hotCoreHandyCss', function( done ){

  done( null, {
    csses: [ 'handyCss.css' ]
  });

});


hotplate.hotEvents.onCollect( 'clientPath', 'hotCoreHandyCss', function( done ){
  done( null, path.join(__dirname, '../client') );
});


