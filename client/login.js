require(["app/widgets/LoginForm", 'app/lib/Logger'], function( LoginForm , Logger ){


  // Create the "application" object, and places them in the right spot.
  loginForm = new LoginForm( {} , 'loginForm');
  loginForm.startup();

  // Set the onLoginPromise promise so that it
  // refirects to the app after login
  loginForm.onLogin = function(res){
      loginForm.loginButton.cancel();

      // If validation returned OK for that specific workspace, then redirect straight there
      if( res.forWorkspaceId ) {
        window.location = '/ws/' + res.forWorkspaceId;

      // Login was OK, but not for any particular workspace: just go to /pick which will allow users to pick one
      } else {
        window.location = '/pick';
      }
  };


});

