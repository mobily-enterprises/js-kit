define([
  'app/JsonRest',
  ],function(
  JsonRest
  ){



  // Stores
  var stores = {};

  // Make all of the stores, which will be used across the application
  [
    // Non-data calls
    'recoverAnon',
    'loginAnon',
    'logoutAnon',

    // Data calls
    'test',             //
    'workspacesAnon',   //
    'workspaces',       //
    'workspaceSettings',//
    'cities',           //
    'contacts',         //
    'products'          //
  ].forEach( function(i){

    // Exception for the non-data URLs. I will still make them usable with JsonRest, since they are
    // all POST ones (so, it's convenient)
    var path = i.match(/Anon$/) ? '/' : '/' + tokenValue + '/';

    // Create the store
    stores[i] = new JsonRest({
      target: path + i + '/',
			idProperty: '_id',
      sortParam: 'sortBy',
    });
  });

  return stores;
});


    /*
    // Quick function to cancel a submit button IF present
    // This will need improving: it basically tries to call "cancel" of the first button in the
    // first form it finds
    function cancelSubmitButton(){

      // Find the submit button within the form. A bit of guesswork here,
      // will need to improve for forms with multiple buttons
      var submitButton = registry.byId( query("form#"+form.id+" span[role='button']")[0].id );

      // If a .cancel() method is defined, call it and make the button unbusy
      if( typeof(submitButton) == 'object' && submitButton.cancel){
       submitButton.cancel();
      }
    }
    */


