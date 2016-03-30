/*
Copyright (C) 2013 Tony Mobily

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


var
  dummy
, declare = require('simpledeclare')
, async = require('async')
, url = require('url')
, querystring = require('querystring')
;

var HTTPMixin = declare( Object,  {

  // Sends the information out, for HTTP calls.
  // The medium is request._res, which is set in protocolListenHTTP
  protocolSendHTTP: function( request, method, data, cb ){

    var self = this;

    // Sets status and responseBody
    var status = 200;
    var responseBody = data;
    switch( method ){
      case 'post': case 'putNew': status = 201; break;
      case 'delete': if( data == '' ) status = 204; break;
      case 'error': status = data.httpError; responseBody = data.responseBody; break;
    };

    // Sets location and range headers
    switch( method ){
      case 'post':
        request._res.setHeader( 'Location', request._req.originalUrl + data[ self.idProperty ] );
      break;

      case 'putNew':
      case 'putExisting':
        request._res.setHeader( 'Location', request._req.originalUrl );
      break;

      case 'getQuery':
        if( request.options.ranges ){

          // Working out from-to/of
          // Note that if no records were returned, the format should be 0-0/X

          // Nice shorter variables
          var skip = request.options.ranges.skip || 0;
          var total = request.data.total;

          // Work out 'of': it will depend on the grandTotal, and that's it. It's an easy one.
          var of = request.data.grandTotal;

          // If nothing was returned, then the format 0-0/grandTotal is honoured
          if( ! total ) {
            from = 0;
            to = 0;

          // If something was returned, then `from` is the same as `skip`, and `to`
          // will depends on how many records were returned
          } else {
            from = skip;
            to = from + total - 1;
          }

          request._res.setHeader('Content-Range', 'items ' + from + '-' + to + '/' + of );
        }
      break;
    };

    if( responseBody !== '' ){
      request._res.status( status ).json( responseBody );
    } else {
      request._res.status( status ).send( '' );
    }

    cb( null );

  },

  protocolListenHTTP: function( params ){

    var url = this.getFullPublicURL();
    var app = params.app;
    var idName;

    // Public URL must be set
    if( ! url ){
      throw( new Error( "protocolListenHTTP must be called on a store with a public URL" ) );
    }

    // First, look for the last /some/:word in the URL
    var idName = url.match( /:\w*$/ );
    if( ! idName ){
      throw( new Error("A store's URL needs to end with a :columned token representing its ID, this is not valid: " + url ) );
    } else {
      // Found it: normalise it to a simple string rather than the 1 element array we received
      idName = idName[0];
    }

    url = url.replace( /:\w*$/, '');

    // Make entries in "app", so that the application
    // will give the right responses
    app.get(    url + idName, this._getRequestHandler( 'Get' ) );
    app.get(    url,          this._getRequestHandler( 'GetQuery') );
    app.put(    url + idName, this._getRequestHandler( 'Put') );
    app.post(   url,          this._getRequestHandler( 'Post') );
    app.delete( url + idName, this._getRequestHandler( 'Delete') );
  },


  _getRequestHandler: function( action ){

    var self = this;

    if( [ 'Get', 'GetQuery', 'Put', 'Post', 'Delete' ].indexOf( action ) === -1 ){
      throw( new Error("action can be Get, GetQuery, Put, Post, Delete") );
    }

    return function( req, res, next ){

      var request = new Object();

      // Sets all of the required fields for a request
      request.remote = true;
      request.protocol = 'HTTP';
      request.params = self._co( req.params ); // NOTE: this is a copy
      request.body = self._co( req.body ); // NOTE: this is a copy
      request.session = req.session;
      request.options = {};
      try {
        request.options = self._initOptionsFromReq( action, req );
      } catch( e ){ return next( e ); }

      // Sets the request's _req and _res variables, extra fields hooks might want to use
      // request._res will be used as a sending medium by protocolSendHTTP
      request._req = req;
      request._res = res;

      // Process the request, honouring the artificialDelay
      if( self.artificialDelay ) {
        setTimeout( function(){
          // Actually run the request
          self['_make' + action ]( request, next );
        }, Math.floor( Math.random() * self.artificialDelay ) );
      } else {
        self['_make' + action ]( request, next );
      }

    }
  },

  _initOptionsFromReq: function( mn, req ){

    var self = this;

    var options = {};


    // Set the 'overwrite' option if the right header
    // is there
    if( mn == 'Put' ){
      if( req.headers[ 'if-match' ] === '*' )
        options.overwrite = true;
      if( req.headers[ 'if-none-match' ] === '*' )
        options.overwrite = false;
    }

    // deleteAfterGetQuery will depend on the store's setting
    if( mn === 'GetQuery' ){
      if( self.deleteAfterGetQuery ) options.delete = !!self.deleteAfterGetQuery;
    }

    // Put and Post can come with extra headers which will set
    // options.putBefore and options.putDefaultPosition
    if( mn === 'Put' || mn === "Post" ){

      // The header `put-default-position` always wins
      if( typeof( req.headers[ 'put-default-position' ]) !== 'undefined'){

        // Set options.putDefaultPosition depending on passed header. Default is `false`
        if( req.headers[ 'put-default-position' ] === 'start' ){
          options.putDefaultPosition = 'start';
        } else {
          options.putDefaultPosition = 'end';
        }

      // There is no `put-default-position`: see if put-before is set
      // and if it is, set options.putBefore
      // NOTE: in the server context, putBefore ALWAYS needs to be an id, and NEVER null
      } else {

        if( typeof( req.headers[ 'put-before' ] ) !== 'undefined' )
          options.putBefore = req.headers[ 'put-before' ];
      }
    }

    // Set the 'SortBy', 'ranges' and 'conditions' in
    // the options, based on the passed headers

    if( mn == 'GetQuery' ){
      options.sort = self._parseSortBy( req );
      options.ranges = self._parseRangeHeaders( req );
      options.conditionsHash = self._parseConditions( req );
    }

    // If self.defaultSort was passed, then maybe it needs to be applied (depending on options.sort)
    if( self.defaultSort ){

      // If it's not a valid object, it's null, or it IS a valid object but it's empty, apply default sorting
      if( typeof( options.sort ) !== 'object' || options.sort === null  || Object.getOwnPropertyNames( options.sort ).length === 0 ){
        options.sort = self.defaultSort;
      }
    }

    return options;
  },

  _parseSortBy: function( req ){
    var url_parts = url.parse( req.url, false );
    var q = url_parts.query || '';
    var sortObject = {};
    var sortBy, tokens, token, tokenClean;
    var sortDirection, sortField;

    var self = this;

    result = querystring.decode( q );
    sortBy = result.sortBy;

    // No sort options: return an empty object
    if( ! sortBy ) return {};

    tokens = sortBy.split(',');
    for( i = 0; i < tokens.length; i++ ){

      token = tokens[ i ];

      tokenClean = token.replace( '+', '' ).replace( '-', '' ).replace( ' ', '');

      if( self.sortableFields.indexOf( tokenClean ) === -1 ){
        throw( new Error("Field selected for sorting invalid: " + tokenClean) );
      }

      if( tokens[ i ][ 0 ] === ' ' || tokens[ i ][ 0 ] === '+' || tokens[ i ][ 0 ] === '-' ){
        sortDirection = tokens[ i ][ 0 ] == '-' ? -1 : 1;
        sortField = tokenClean;
        sortObject[ sortField ] = sortDirection;
      }
    }
    return sortObject;
  },

  _parseRangeHeaders: function( req ){

    var tokens;
    var rangeFrom, rangeTo, limit;
    var hr;

    // If there was a range request, then set the range to the
    // query and return the count
    if( (hr = req.headers['range']) && ( tokens = hr.match(/items=([0-9]+)\-(([0-9]+)||(Infinity))$/))  ){
      rangeFrom = tokens[1] - 0;
      rangeTo = tokens[2] - 0;
      if( rangeTo == 'Infinity' ){
        return ({
          //from: rangeFrom
          skip: rangeFrom
        })
      } else {

        limit =  rangeTo - rangeFrom + 1;

        return( {
          skip: rangeFrom,
          limit: limit,
        });

      }
    }

    // Range headers not found or not valid, return null
    return null;
  },

  _parseConditions: function( req ){

    var url_parts = url.parse( req.url, false );
    var q = url_parts.query || '';
    var result;

    result = querystring.decode( q );
    delete result.sortBy;

    return result;
  },



});

exports = module.exports = HTTPMixin;
