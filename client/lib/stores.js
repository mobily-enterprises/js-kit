define([
  'app/JsonRest',
  ],function(
  JsonRest
  ){



  // Stores
  var stores = {};

  // Make all of the stores, which will be used across the application
  [
    'loginAnon',
    'workspacesAnon',
    'recoverAnon',
    'workspaces',
    'workspaceSettings',
    'cities',
    'contacts',
    'products'
  ].forEach( function(i){
    console.log("I is " + i);
    stores[i] = new JsonRest({
      target:'data/' + i + '/',
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


