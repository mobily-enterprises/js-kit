
var hotplate = require('hotplate');

exports.init = function(){
 
  /* 
   ****************************************************************
   * PAGES
   ****************************************************************
  */

  // app.get('/pages/ws',                        function(req, res, next){ res.redirect('/pages/login'); } );
  hotplate.app.get('/pages/ws/:workspaceIdPages',    mainApp);

} 

function mainApp(req, res ){

  // User is not logged in (?!?): redirect to the login page
  // if(! req.session.loggedIn ){
  //  res.redirect('/pages/login');
  //  return;
  // }

  // Render the index page -- yay!
  res.render('ws',  {
    layout: false,
    login: req.session.login,
    workspaceId: req.application.workspaceId,
    workspaceName: req.application.workspaceName,
 });
};



}
