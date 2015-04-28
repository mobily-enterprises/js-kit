"use strict";

var dummy
  , hotplate = require('hotplate')

  , Vars = require('./Vars.js')
  , Csses = require('./Csses.js')
  , Jses = require('./Jses.js')
  , HeadLines = require('./HeadLines.js')
  , BodyLines = require('./BodyLines.js')
  , TitleWords = require('./TitleWords.js')
;


// Exports the element constructors as well
exports.Vars = Vars;
exports.Csses = Csses;
exports.Jses = Jses;
exports.HeadLines = HeadLines;
exports.BodyLines = BodyLines;
exports.TitleWords = TitleWords;

var hotCorePage = exports;

var TYPES = [ 'vars', 'jses', 'csses', 'headLines', 'bodyLines', 'titleWords' ];

hotplate.config.set('hotCorePage.pageTemplate', "<!DOCTYPE HTML>\n<html>\n<head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" /><title>[[titleWords]]</title>\n[[headLines]]\n[[vars]]\n[[csses]]\n[[jses]]\n</head>\n<body>[[bodyLines]]</body>\n</html>\n");

// This function will get the keys `jses`, `csses`, `vars` and `headLines` of
// the object `elements` and will enrich them with what's in `results`

function enrichElementsWithHookResults( elements, results ) {

  results.forEach( function(element) {
    var moduleName = element.module;
    var result = element.result;

    for( var type in result){
      result[ type ].forEach( function( item ){
        elements[ type ].add( moduleName, item );
      });
    }
  });
}

function replacePageElements( template, elements){

  template = template.replace( /\[\[(.*)\]\]/g, function( match, type ){

    if( TYPES.indexOf( type ) !== -1 ){
      //return elements[ type ].render().replace(/\$/g, '$$$$'); 
      return elements[ type ].render(); 
    } else {
      return '[[' + type + ']]';
    }

  });

  return template;
}


function capitalise( string ){
  return string.charAt(0).toUpperCase() + string.slice(1);
}

var acquireElements = exports.acquireElements = function( parameterElements, req, pageName, done ){

  var parameterElements = parameterElements || {};

  // Create the basic elements object with empty objects for each key
  var elements = {};
  TYPES.forEach( function( type ){
    elements[ type ] = new hotCorePage[ capitalise( type ) ];
  });

  // Get the pageElement elements
  hotplate.hotEvents.emitCollect( 'pageElements', function( err, results ){
    if( err ){
      done( err );
    } else {

      enrichElementsWithHookResults( elements, results ); 

      // Get the pageElementsPerPage
      hotplate.hotEvents.emitCollect('pageElementsPerPage', req, pageName, function( err, results ){
        if( err ){
          done( err );
        } else {

          enrichElementsWithHookResults( elements, results );

          // Concatenating whatever was in the command line with the retrieved info
          TYPES.forEach( function( type ){
            if( parameterElements[ type ] ) elements[ type ].concat( parameterElements[ type ] );
            
          });

          done( null, elements );
        };
      });
    }
  });
}

var getElementsAsStrings = exports.getElementsAsStrings = function( parameterElements, req, pageName, done ){

  var r = {};

  acquireElements( parameterElements, req, pageName, function( err, elements ){
    if( err ){
      done( err );
    } else {

      TYPES.forEach( function( type ){
        r[ type ] = elements[ type ].render();
      });

      done( null, r );
    }
  });

};



// This is the actual API function that is _actually_ exported. It allows developers
// to render a page which will 1) Contain all of the app-wide elements 2) Contain
// any page-wide element possibly injected by other modules 3) Not contain any
// placeholders
exports.processPageTemplate = function( parameterElements, req, pageName, done ) {

  var r;

  //getElementsAsStrings( parameterElements, req, pageName, function( err, elements ){
  //  console.log( '******************************' , elements );
  //});

  acquireElements( parameterElements, req, pageName, function( err, elements ){
    if( err ){
      done( err );
    } else {
      r = replacePageElements( hotplate.config.get( 'hotCorePage.pageTemplate' ), elements );

      done( null, r );
    }
  }); 
}
