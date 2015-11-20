define( [

  "dojo/_base/declare"
, "dojo/cookie"
, "dojo/topic"

, "../buttons/_SignInRecoverRegisterButton"
, "../buttons/_ManagerButton"
, "../buttons/_ResumeButton"

], function(

  declare
, cookie
, topic

, _SignInRecoverRegisterButton
, _ManagerButton
, _ResumeButton

){

  var ret = {};

  var urlPrefix = vars.hotCorePage.routeUrlsPrefix;

  var SignInRecoverRegisterBase = declare( [ _SignInRecoverRegisterButton ], {
    strategyId: 'facebook',
    action: 'signin',

    postCreate: function(){
      var self = this;

      this.inherited( arguments );

      var action = self.action;
      if( action !== 'signin' && action !== 'recover' && action !== 'register' ){
        action = 'signin';
      }

      self.button.on('click', function( e ){
        cookie( 'facebook-' + self.action, 'redirect-opener', { path: '/' } );
        window.open( urlPrefix + '/auth/' + self.action + '/facebook/web', '', 'width=800, height=600');
      });
    },
  });

  ret.SignIn = declare( [ SignInRecoverRegisterBase ], {
    action: 'signin'
  });

  ret.Recover = declare( [ SignInRecoverRegisterBase ], {
    action: 'recover'
  });

  ret.Register = declare( [ SignInRecoverRegisterBase ], {
    action: 'register'
  });

  ret.Resume = declare( [ _ResumeButton ], {
    strategyId: 'facebook',

    postCreate: function(){
      var self = this;

      this.inherited( arguments );

      self.button.on('click', function( e ){
        cookie( 'facebook-resume', 'content', { path: '/' } );
        window.open( urlPrefix + '/auth/resume/facebook/web', '', 'width=800, height=600');
        topic.publish( 'hotClientDojo/auth/resuming' );
      });
    },



  });

  ret.Manager = declare( [ _ManagerButton ], {

    strategyId: 'facebook',

    postCreate: function(){
      this.inherited( arguments );

      var self = this;

      self.button.on('click', function( e ){
        if( ! self.userStrategyData ){
          cookie( 'facebook-manager', 'close', { path: '/' } );
          window.open( urlPrefix + '/auth/manager/facebook/web', '', 'width=800, height=600');
        } else {
          self._deleteStrategyData( "Delete credentials?", "Are you sure you want to unlink your Facebook account?" );
        }
      });

    },

  });

  return ret;
});
