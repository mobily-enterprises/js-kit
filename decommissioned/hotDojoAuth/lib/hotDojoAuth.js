var dummy
  , hotplate = require('hotplate')
  , path = require('path')
  , db = hotplate.get('db')
  , ObjectId = require('mongowrapper').ObjectId
;


/*
Comprehensive login framework for hotPlate.
A few facts:

## SESSION

To be "logged in" means that: 

 - req.session.loggedIn == true
 - req.session.login    == <username>
 - req.session.userId == <userId>

The variable `req.session.login` MAY hang around (is not zeroed on logout) as it MAY be used to pre-set the login field

## MIDDLEWARE VARIABLES

Using workspaceId (AJAX) tokenIdCall (AJAX) and workspaceIdPages (pages), the following
variables in req will be set:

 - req.application.workspace
 - req.application.user
 - req.application.access

*/

var app = hotplate.app;

exports.hotHooks = hooks = {}

hooks.init = function( done ){

  done( null );
}


hooks.pageElements = function( done ){
  done( null, { moduleName: 'hotDojoAuth', result:{
    jses: [ 'mainRetypePasswordDialog.js' ],
  } } );
}


hooks.run = function( done ){

   // Pages
  app.get('/pages/login' , pageLogin);
  app.get('/pages/login/:workspaceName' , pageLoginWorkspace, pageLogin );
  app.get('/pages/register' , pageRegister );
  app.get('/pages/pick' , pagePick );

  done( null );
}

hooks.clientPaths = function( done ){
  done( null, { moduleName: 'hotDojoAuth', result: [ path.join(__dirname, '../client') ] } );
}


hooks.stores = function( done ){
  done( null );
}



/* **************************************************
 *
 * Pages
 *
 * **************************************************
*/

var pageLoginWorkspace = function( req, res, next ){

  var workspaces = db.collection('workspaces');

  workspaces.findOne( { name: req.params.workspaceName.toLowerCase() }, function( err, doc ){
    if(err){
       res.status = 500;
       hotplate.get('errorPage')(req, res, next);
    } else {
      if( doc ){
        next();
      } else {
        res.status = 404;
        hotplate.get('errorPage')(req, res, next);
      }
    }
  });
}


var pageLogin = function(req, res, next){

  var workspaces = db.collection('workspaces');
  var hotCorePage = hotplate.getModule('hotCorePage');
  var logger = hotplate.getModule('hotCoreServerLogger');

  // CASE #1: The user IS NOT logged in. Show the straight login form,
  //          after setting the right variables
  if(! req.session.loggedIn){

    var extraJses = (new hotCorePage.Jses).add('hotDojoAuth', 'mainLogin.js');
    var extraCsses = (new hotCorePage.Csses).add('hotDojoAuth', 'rrl.css');
    var extraVars = new hotCorePage.Vars();

    extraVars.add( 'hotDojoAuth', 'loggedIn', false );
    extraVars.add( 'hotDojoAuth', 'login',  typeof( req.session.login )  === 'undefined' ? '' : req.session.login );
    extraVars.add( 'hotDojoAuth', 'userId', typeof( req.session.userId ) === 'undefined' ? '' : req.session.userId );

    hotCorePage.processPageTemplate(
      {
        jses:extraJses,
        csses:extraCsses,
        vars:extraVars,
        body: '<body class="claro"><div id="loginForm"></div></body>'
      },
      req,
      'hotDojoAuth/loginForm',
      function( err, result ){
        if( err ){
          hotplate.get('errorPage')(req, res, next);
        } else {
          res.send( result );
          logger.log( { message: "Login page served" } );
        }
      }
    );
    return;
  }

  // CASE #2: The user IS logged in. Redirect to pick()
  if( req.session.userId ){
    res.redirect('/pages/pick');
  }

};


var pageRegister = function(req, res, next){

    var hotCorePage = hotplate.getModule('hotCorePage');
    var logger = hotplate.getModule('hotCoreServerLogger');

    var extraJses = (new hotCorePage.Jses).add('hotDojoAuth', 'mainRegister.js');
    var extraCsses = (new hotCorePage.Csses).add('hotDojoAuth', 'rrl.css');
    var extraVars = new hotCorePage.Vars();


    // Set variables which will definitely be useful to javascript within pages
    // For example `loggedIn`  will tell the Javascript in the register page that the user is already
    // logged in. The "login" variable is also set so that the form can also pre-set the
    // login field, which is a nice bonus
    // 
    if( req.session.loggedIn){
      extraVars.add('hotDojoAuth', 'loggedIn', true );
      extraVars.add('hotDojoAuth', 'login', req.session.login );
      extraVars.add('hotDojoAuth', 'userId', req.session.userId );
    } else {
      extraVars.add('hotDojoAuth', 'loggedIn', false );
      extraVars.add('hotDojoAuth', 'login', typeof( req.session.login ) === 'undefined' ? '' : req.session.login );
      extraVars.add('hotDojoAuth', 'userId', typeof( req.session.userId) === 'undefined' ? '' : req.session.userId );
    }

    result = hotCorePage.processPageTemplate(
      { 
        jses : extraJses,
        csses:extraCsses,
        vars : extraVars,
        body : '<body class="claro"><div id="registerForm"></div></body>' 
      },
      req,
      'hotDojoAuth/registerPage',
      function( err, result ){
        res.send( result );
        logger.log( { message: "Register page served" } );
      }
    );

  };


var pagePick = function(req, res, next){

  var hotCorePage = hotplate.getModule('hotCorePage');
  var logger = hotplate.getModule('hotCoreServerLogger');

  // User is not logged in: redirect to the login page
  if(! req.session.loggedIn ){
    res.redirect('/pages/login');
    return;
  }

  // Make up a list of workspaces user has access to, and pass it to the jade template
  var list = [];
  var workspaces = db.collection('workspaces');
 
  workspaces.find( { 'access._id': ObjectId( req.session.userId ) }).toArray( function( err, docs ){
    if( err ){
      Logger({ logLevel: 4, errorName: err.name, message: err.message, req: req });
      res.status = 500;
      hotplate.get('errorPage')(req, res, next);
    } else {
      docs.forEach( function(workspace){
        list.push( { name: workspace.name, id: workspace._id } );
      });

      // hotplate.log("%j", list );

      var extraCsses = (new hotCorePage.Csses).add('hotDojoAuth', 'rrl.css');
      var extraVars = new hotCorePage.Vars();
      extraVars.add( 'hotDojoAuth', 'loggedIn', true );
      extraVars.add( 'hotDojoAuth', 'login', req.session.login );
      extraVars.add( 'hotDojoAuth', 'userId', req.session.userId );

      // There are no workspaces available
      if( list.length == 0){

        hotCorePage.processPageTemplate(
          {
            csses: extraCsses,
            vars : extraVars,
            body : '<body class="claro">' +
                   '  <div id="pickFormEmpty">' +
                   '    <p id="noWorkspaces">No workspace to pick!</p>' +
                   '    <p id="registerInstead">Go and <a href="/pages/register">register one</a>!</p>' +
                   '  </div>' +
                   '</body>'
          },
          req,
          'hotDojoAuth/pickButEmptyPage',
          function(err, result){
            res.send( result );
         }
        );

      // If there is only one workspace in the list, there is no point in having to pick: goes straight there
      } else if( list.length == 1){
        res.redirect( hotplate.get('afterLoginPage') + list[0].id);

      // There is a proper list of workspaces -- let the user pick
      } else {

        // Render the pick list 
        var pickList = '<ul class="simpleList">' + "\n";
        list.forEach(function(item){
          pickList += '<li><a href="' + hotplate.get('afterLoginPage') + item.id + '">' + item.name + '</a></li>' + "\n";
        });
        pickList += "</ul>" + "\n";

        var extraCsses = (new hotCorePage.Csses).add('hotDojoAuth', 'rrl.css');

        hotCorePage.processPageTemplate(
          {
            csses: extraCsses, 
            vars : extraVars,
            body : '<body class="claro"><div id="pickForm">' + pickList + '</div></body>' 
          },
          req,
          'hotDojoAuth/pickPage',
          function( err, result ){
            res.send( result );
            logger.log( { message: "Pick page served" } );
          } 
        );

      }
    }
  });

};


