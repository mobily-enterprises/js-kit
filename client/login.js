require(["app/widgets/LoginForm", 'app/lib/Logger'], function( LoginForm , Logger ){


  // Create the "application" object, and places them in the right spot.
  loginForm = new LoginForm( {} , 'loginForm');
  loginForm.startup();

  // Set the onLoginPromise promise so that it
  // refirects to the app after login
  loginForm.onLogin = function(res){
      loginForm.loginButton.cancel();
      window.location = '/app';
  };


});

