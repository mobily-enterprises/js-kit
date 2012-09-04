define([
  'app/widgets/AlertBar',
  'dijit/Dialog',
  ],function(
  AlertBar
  , Dialog
  ){

  var gw = {};

  // Puts the networkAlertBar into place
  gw.networkAlertBar = new AlertBar( {
     message: "The application experienced a network error!",
     background: '#FF4444',
   }, 'network-alert-bar' );

  gw.appAlertBar = new AlertBar( {
     message: "",
     background: '#FF4444',
   }, 'app-alert-bar' );

  return gw;
});


