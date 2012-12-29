
require([
  "dojo/_base/declare",
  "dojo/_base/json",
  "dojo/store/Observable",
  "dojo/topic",
  "dojo/on",
  "dojo/dom",
  "dojo/dom-class",
  "dojo/dom-construct",
  "dojo/when",

  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/form/Form",
  'dijit/layout/TabContainer',
  'dijit/layout/ContentPane',
  "dijit/Destroyable",

  'dgrid/OnDemandGrid',
  'dgrid/OnDemandList',
  'dgrid/Keyboard',
  'dgrid/Selection',
  'dgrid/_StoreMixin',

  "dojo/domReady!",


   ], function(
     declare
     , json
     , Observable
     , topic
     , on
     , dom
     , domClass
     , domConstruct
     , when

     , _WidgetBase
     , _TemplatedMixin
     , _WidgetsInTemplateMixin
     , Form
     , TabContainer
     , ContentPane
     , Destroyable

     , OnDemandGrid
     , OnDemandList
     , Keyboard
     , Selection
     , _StoreMixin

 ){


  console.log('1');

/*
  declare('AdminLogs', [ContentPane, _TemplatedMixin, _WidgetsInTemplateMixin ], {

    widgetsInTemplate: true,

    templateString: '' +
      '<div>' +
      '  <div id="grid"></div>' + 
      '</div>',

    postCreate: function(){
      this.inherited(arguments);
      var that = this;
    }, // postCreate


    onShow: function(){
      this.inherited(arguments);
      console.log("Shown!");
    },



    startup: function(){

      console.log("HERE!");

      this.inherited(arguments);

      var customGrid = declare( [OnDemandGrid, Keyboard, Selection, _OverlayMixin ]);    

      var grid = new customGrid({
        columns: {
          loggedOn: "Logged On",
          data: "Data",
          errorName: 'Error name',
          logLevel: "Log level",
          message: "Message",
          _id: "ID",
        },
        // selectionMode: "extended",
        cellNavigation: true,
    //    store: stores('logs:data', { workspaceIdCall: vars['hotDojoAppContainer']['workspaceId'] } ) ,
    //    query: {} , //  data: 'pp' },
        // query: {errorName: 'Refe', logLevel: 0 },
    //    sort: [
    //      { attribute: 'logLevel', descending: true },
    //      { attribute: 'data', descending: true },
    //    ],

      }, "grid");

      grid.refresh();

      grid.on('dgrid-error', function(event){
        topic.publish( 'globalAlert', 'Dgrid error: ' + event.error.message, 5000 );
      });

      grid.onOverlayClick = function(event){
        grid.refresh();
        grid.set('overlayed', false );
      };
    }


  });

*/


  // var AdminTabContainer = declare('AdminTabContainer', [ ContentPane, _TemplatedMixin, _WidgetsInTemplateMixin ], {
  // var AdminTabContainer = declare('AdminTabContainer', [ _WidgetBase ], {
  var AdminTabContainer = declare('AdminTabContainer', {

//    widgetsInTemplate: true,

//    templateString: '' +
//      '<div class="adminSection" >' +
//      '  <div data-dojo-attach-point="widget" data-dojo-type="dijit/layout/ContentPane">AAA' +
//      '    <div data-dojo-type="dijit/layout/TabContainer" data-dojo-props="tabPosition: \'top\'" data-dojo-attach-point="settingsTab">' +
//      '      <div data-dojo-type="AdminLogs" data-dojo-attach-point="logs" data-dojo-props="title: \'Logs\'"></div>' +
//      '    </div>' +
//      '  </div>' +
//      '</div>',
  });

 
  console.log("HERE!");
  var a = new AdminTabContainer( {} );
  // a.startup();

});



