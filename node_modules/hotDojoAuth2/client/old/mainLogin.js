require([
  'dojo/ready',
  "hotplate/hotDojoAuth/LoginForm",
  'hotplate/hotDojoLogger/logger',
  ], function( 
   ready
  , LoginForm
  , logger ){


  ready( function() {
    // Create the "application" object, and places them in the right spot.
    loginForm = new LoginForm( {} , 'loginForm');
    loginForm.startup();

    // Set the onLogin callback so that it
    // redirects to the app after login
    loginForm.onLogin = function(res){
      loginForm.loginButton.cancel();

      // If validation returned OK for that specific workspace, then redirect straight there
      if( res.forWorkspaceId ) {
        window.location = vars.hotplate.afterLoginPage + res.forWorkspaceId;

      // Login was OK, but not for any particular workspace: just go to /pick which will allow users to pick one
      } else {
        window.location = '/pages/pick';
      }
    };

  });

});

