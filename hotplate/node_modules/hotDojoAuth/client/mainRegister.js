require(["hotplate/hotDojoAuth/RegisterForm", 'dojo/ready' ], function( RegisterForm, ready ){


  // Create the "application" object, and places them in the right spot.
  ready(function() {
    registerForm = new RegisterForm( {} , 'registerForm');
    registerForm.startup();
  });


});

