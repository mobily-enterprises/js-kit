define( [

  "dojo/topic"

, "hotplate/hotClientDojo/auth/Welcome" 

], function(

  topic

, Welcome

){

  topic.subscribe( 'hotplateModulesLoaded', function(){
    var w = new Welcome({}, 'welcome' ); 
    w.startup();
  });

});
