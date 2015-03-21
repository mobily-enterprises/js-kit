
define( [

  "dojo/topic"
, "dojo/ready"
, "hotplate/hotClientDojo/appContainer/AppContainer"

], function(

  topic
, ready
, AppContainer

){

  topic.subscribe( 'hotplateModulesLoaded', function(){

    // Create the "application" object, places them in the right spot, start it up
    appContainer = new AppContainer( {} , 'app-container');
    appContainer.startup();
  }); 

});

