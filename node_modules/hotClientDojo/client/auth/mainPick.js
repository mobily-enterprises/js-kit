define( [ 

  "dojo/topic"

, "hotplate/hotClientDojo/auth/Pick"

], function( 

  topic

, Pick

){

  topic.subscribe( 'hotplateModulesLoaded', function(){

    var w = new Pick({}, 'pick' ); 
    w.startup();
  });
});
