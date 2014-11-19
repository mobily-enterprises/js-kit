
// ALL PERMISSIONS FOR A STORE, INHERITING THE OTHER ONES

      checkPermissionsPost: function checkPermissionsPost( request, cb ){
        var self = this;

        self.inheritedAsync( checkPermissionsPost, arguments, function( err, res ){
          if( err ) return cb( err );
          if( ! res ) return cb( null, false );

          cb( null, true );
        });

      },
      checkPermissionsPutNew: function checkPermissionsPutNew( request, cb ){
        var self = this;

        self.inheritedAsync( checkPermissionsPutNew, arguments, function( err, res ){
          if( err ) return cb( err );
          if( ! res ) return cb( null, false );

          cb( null, true );
        });
      },
      checkPermissionsPutExisting: function checkPermissionsPutExisting( request, doc, fullDoc, cb ){
        var self = this;

        self.inheritedAsync( checkPermissionsPutExisting, arguments, function( err, res ){
          if( err ) return cb( err );
          if( ! res ) return cb( null, false );

          cb( null, true );
        });
      },
      checkPermissionsGet: function checkPermissionsGet( request, doc, fullDoc, cb ){
        var self = this;

        self.inheritedAsync( checkPermissionsGet, arguments, function( err, res ){
          if( err ) return cb( err );
          if( ! res ) return cb( null, false );

          cb( null, true );
        });
      },
      checkPermissionsGetQuery: function checkPermissionsGetQuery( request, cb ){
        var self = this;

        self.inheritedAsync( checkPermissionsGetQuery, arguments, function( err, res ){
          if( err ) return cb( err );
          if( ! res ) return cb( null, false );

          cb( null, true );
        });
      },
      checkPermissionsDelete: function checkPermissionsDelete( request, doc, fullDoc, cb ){
        var self = this;

        self.inheritedAsync( checkPermissionsDelete, arguments, function( err, res ){
          if( err ) return cb( err );
          if( ! res ) return cb( null, false );

          cb( null, true );
        });
      },
