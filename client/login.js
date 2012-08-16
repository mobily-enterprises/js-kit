require(["app/widgets/LoginForm"], function( LoginForm){


  // Create the "application" object, and places them in the right spot.
  loginForm = new LoginForm( {} , 'loginForm');
  loginForm.startup();

});

