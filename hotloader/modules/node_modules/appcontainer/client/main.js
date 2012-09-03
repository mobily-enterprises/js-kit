
require(["app/widgets/AppMainScreen" ], function( AppMainScreen){

  // Create the "application" object, and places them in the right spot.
  appMainScreen = new AppMainScreen( {} , 'appMainScreen');
  appMainScreen.startup();
});

