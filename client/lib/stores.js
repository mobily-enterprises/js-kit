define([
  'app/JsonRest',
  'dojo/domReady!',
  ],function(
  JsonRest
  ){


  // Stores
  var stores = {},
      path;
  

  // Initialise tokenValue (might not be set)
  if( typeof(tokenValue) == 'undefined' ){
    tokenValue = null;
  }
 

  // Make all of the stores, which will be used across the application
  [
    // Non-data calls
    'recoverAnon',
    'loginAnon',
    'logoutUser',

    // Data calls
    'workspacesAnon',   //
    'usersAnon',   //
    'workspacesUser',   //
    'workspaceSettings',//
    'users',           //
    'contacts',         //
    'products'          //
  ].forEach( function(i){

    // Check if the call is anonymous
    isAnon = i.match(/Anon$/);
    isUser = i.match(/User$/);

    // tokenValue = '873535f1b3c3cfffe76a68dfc9048647';
     
    // Either the token must be set, or the call needs to be a /user or /anon call
    if( tokenValue || isAnon || isUser ){

      // Set the path depending on the store's name, to keep URL namespace clean
      path = isAnon ? '/anon/' : ( isUser ?  '/user/' : '/api/1/' + tokenValue + '/') ;

      // console.log("Creating store " + path + i + '/');

      // Create the store
      stores[i] = new JsonRest({
        target: path + i + '/',
		  	idProperty: '_id',
        sortParam: 'sortBy',
      });
    }
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


