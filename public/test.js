
require([
  "dojo/_base/declare",
  "dojo/_base/json",
  "dojo/store/Observable",
  "dojo/store/Memory",
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
  'dijit/layout/BorderContainer',

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
     , Memory
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
     , BorderContainer

     , OnDemandGrid
     , OnDemandList
     , Keyboard
     , Selection
     , _StoreMixin

 ){


  console.log('1');

  declare('AdminLogs', [ContentPane, _TemplatedMixin, _WidgetsInTemplateMixin ], {

    widgetsInTemplate: true,

    templateString: '' +
      '<div style="height:100%">' +
      '  <div id="grid" style="height:100%" ></div>' + 
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

      var customGrid = declare( [OnDemandGrid, Keyboard, Selection ]);    

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
        store: new Memory( { data: {} } ),
        query: {} , //  data: 'pp' },
         query: {errorName: 'Refe', logLevel: 0 },
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

  // var AdminTabContainer = declare('AdminTabContainer', [ ContentPane, _TemplatedMixin, _WidgetsInTemplateMixin ], {
  // var AdminTabContainer = declare('AdminTabContainer', [ _WidgetBase ], {
  var AdminTabContainer = declare('AdminTabContainer', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin] , {

    widgetsInTemplate: true,


    templateString: '' +
      '<div class="adminSection" style="height:100%" >' +
      '  <div data-dojo-attach-point="widget" data-dojo-type="dijit/layout/ContentPane" style="height:100%">' +
      '    <div data-dojo-type="dijit/layout/TabContainer" data-dojo-props="tabPosition: \'top\'" data-dojo-attach-point="settingsTab" style="height:100%">' +
      '      <div data-dojo-type="AdminLogs"  data-dojo-attach-point="logs" data-dojo-props="title: \'Logs\'" ></div>' +
      '      <div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="title: \'Other\'">ppp</div>' +
      '    </div>' +
      '  </div>' +
      '</div>',
  });


 var Bd = declare( [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin ], {

      workspaceName: 'ppppp',

      widgetsInTemplate: true,

      templateString: '' +
        '<div>' +
        '  <div class="bookingDojo" data-dojo-type="dijit/layout/BorderContainer" data-dojo-props="gutters:false, design: \'headline\'" style="height:100%">' +
        '    <div class="appHeader" stylee="padding:0; margin:0;" data-dojo-type="dijit/layout/ContentPane" data-dojo-props="gutters:false, region: \'top\'">' +
        '    </div>' +

        '    <div data-dojo-attach-point="mainTabContainer" data-dojo-type="dijit/layout/TabContainer" data-dojo-props="region: \'center\', tabPosition: \'left-h\'" class="high">' +
        '      <div data-dojo-attach-point="dashboard" data-dojo-type="dijit/layout/ContentPane" data-dojo-props="title:\'Dashboard\'"></div>' +
        '      <div data-dojo-attach-point="inbox" data-dojo-type="dijit/layout/ContentPane" data-dojo-props="title: \'Inbox\'"></div>' +
        '      <div data-dojo-attach-point="search" data-dojo-type="dijit/layout/ContentPane" data-dojo-props="title:\'Search\'"></div>' +
        '      <div data-dojo-attach-point="calendar" data-dojo-type="dijit/layout/ContentPane" data-dojo-props="title:\'Calendar\'"></div>' +
        '      <div data-dojo-attach-point="contacts" data-dojo-type="dijit/layout/ContentPane" data-dojo-props="title:\'Contacts\'"></div>' +
        '      <div data-dojo-attach-point="admin" data-dojo-type="AdminTabContainer" data-dojo-props="title: \'Admin\'" style="height:100%"></div>' +

        '    </div>'+

        '  </div>' +
        '</div>',

        postCreate:function(){
          this.inherited(arguments);
        },

  });

 
  var Container = declare( [ BorderContainer ], { design: 'headLine', postcreate:function(){ this.inherited(arguments); }, });

  c = new Container({}, app); 
  c.startup();

 
  console.log("HERE!");
  var a = new AdminTabContainer( {id: 'adminTabContainer' } );
  var bd = new Bd( { id: 'bookingDojo', region: 'center', style:"height:100%" } );
  bd.startup();

  c.addChild(bd);

});



