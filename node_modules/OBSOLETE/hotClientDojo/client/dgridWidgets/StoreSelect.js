define([
  "dojo/_base/declare"
, "dojo/when"
, "dojo/topic"
, "dojo/on"
, "dojo/dom-construct"
, "dojo/dom-style"
, "dojo/dom-attr"
, "dojo/dom-class"
, "dojo/dom-geometry"
, "dojo/_base/lang"

, "dijit/_WidgetBase"
, "dijit/_OnDijitClickMixin"
, "dijit/_Container"
, "dijit/layout/_ContentPaneResizeMixin"
, "dijit/_TemplatedMixin"
, "dijit/_WidgetsInTemplateMixin"
, "dijit/form/_FormValueMixin"

, "dgrid/OnDemandList"
, "dgrid/Selection"
, "dgrid/Keyboard"
, "dgrid/extensions/DijitRegistry"
, "put-selector/put"

, "hotplate/hotClientDojo/widgets/_OverlayMixin"
, "hotplate/hotClientDojo/stores/stores"

], function(
  declare
, when
, topic
, on
, domConstruct
, domStyle
, domAttr
, domClass
, domGeometry
, lang

, _WidgetBase
, _OnDijitClickMixin
, _Container
, _ContentPaneResizeMixin
, _TemplatedMixin
, _WidgetsInTemplateMixin
, _FormValueMixin

, OnDemandList
, Selection
, Keyboard
, DijitRegistry
, put

, _OverlayMixin
, stores

){

  return declare( [ _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _Container, _ContentPaneResizeMixin, _OnDijitClickMixin, _FormValueMixin, _OverlayMixin ] , {

    templateString: '<div class="store-select">\n' +
                    '    <div data-dojo-attach-point="itemNode" class="picked">\n'+
                    '      <div class="label button"><div data-dojo-attach-point="focusNode,labelNode">Pick</div></div>\n' +
                    '      <div class="arrow button"></div>\n' +
                    '    </div>\n'+
                    '    <div data-dojo-attach-point="listWidgetNode" class="dgrid-spot"></div>\n'+
                    '    <input type="hidden" ${!nameAttrSetting} data-dojo-attach-point="valueNode" value="${value}" aria-hidden="true" />\n'+
                    '</div>\n'+
                    '\n'+
                    '',


    widgetsInTemplate: true,

    // Store
    //store: null,

    ownClass: null,

    // Store name. Useful for topics etc.
    storeName: '',
    storeParameters: null,

    initialSort: [],
    initialFilter: null,

    // Refresh immediately on refreshData topic
    immediateRefresh: false,

    // renderRow which will be used by the created dgrid.
    // It needs to be defined
    renderRow: function( o ){ return "renderRow not defined"; } ,

    // The list widget
    listWidget: null,

    // Whether the listWidget is visible or not
    expanded: false,

    // When automatically moving based on the current window,
    // the minimum distance to the bottom
    distanceFromBottom: 20,

    _loadingValue: false,

    // Proxy method for listwidget.row()
    row: function( p ){
      if( this.listWidget ){
        return this.listWidget.row( p );
      }
    },

    resize: function(){
      this._moveIfNecessary();
      this.inherited(arguments); 
    },

    destroy: function(){
      this.listWidget.destroy();
      this.inherited(arguments); 
    },


    // STOLEN FROM _FormWidget.js
    postMixInProperties: function(){
      // Setup name=foo string to be referenced from the template (but only if a name has been specified)
      // Unfortunately we can't use _setNameAttr to set the name due to IE limitations, see #8484, #8660.
      // Regarding escaping, see heading "Attribute values" in
      // http://www.w3.org/TR/REC-html40/appendix/notes.html#h-B.3.2
      this.nameAttrSetting = this.name ? ('name="' + this.name.replace(/"/g, "&quot;") + '"') : '';
      this.inherited(arguments);
    },


    // Override automatic assigning type --> focusNode, it causes exception on IE.
    // Instead, type must be specified as ${type} in the template, as part of the original DOM
    _setTypeAttr: null,

    // Sets valueNode in the DOM
    _setValueAttr: function(value){

      this.inherited(arguments);
      var self = this;

      self._set( 'value', value );

      // Set the valueNode (the hidden field in this widget)
      domAttr.set(this.valueNode, "value", value);
      // domAttr.set(this.valueNode, "value", this.get("value"));

      if( value ){

        // If the row is displayed in the dgrid List, then take it from there...
        var row = self.row( value );
        if( row && row.data ){
          if( self.labelNode ){
            self.labelNode.innerHTML = '';
            put( self.labelNode, self.renderRow( row.data ) );
          } 

        // Otherwise, if the raw is not in the dgrid list, load it up
        } else {

          when( self.store.get( value ) ).then(

            function( data ){
              self.labelNode.innerHTML = '';
              put( self.labelNode, self.renderRow( data ) );
            },
            function( err ) {
              self.labelNode.innerHTML = "ID: " + value;
            }

          );

          //self.labelNode.innerHTML = "ID: " + value;
        }
      }

    },

    startup: function(){
      this.inherited(arguments);
    },

    postCreate: function(){

      this.inherited(arguments); 

      var self = this;

      // Make up the store internal variable
      this.store = stores( this.storeName, this.storeParameters );

      // Set this widget's own class, if defined in prototype
      if( self.ownClass ){
        domClass.add( self.domNode, self.ownClass );
      }

      // Overlayed, non-clickable by default
      //self.set( 'overlayStatus', { overlayed: true, clickable: false } );

      // Make up the constructor for the select list. It's basically a dgrid, with the
      // renderRow set as the parent's, and single selection mode
      var ListConstructor = declare( [ OnDemandList, Selection, Keyboard, DijitRegistry ], {
        renderRow: self.renderRow,
        selectionMode: 'single',
        //minRowsPerPage: 0, // Download the _lot_, or selected item might not be in memory

        // Adding and deleting rows will trigger the "position calculation"
        // function to make sure that the select list is not ourside of the
        // visible area
        newRow: function(){
          var r = this.inherited(arguments);
          self._moveIfNecessary();
          return r;
        },
        removeRow: function(){
          var r = this.inherited(arguments);
          self._moveIfNecessary();
          return r;
        },
       
        postCreate: function(){
          this.inherited(arguments);
        },
 
      } );
      
      // Make up the collection with the initial sorting/filters
      var collection = self.store;
      if( self.initialSort.length) collection = collection.sort( self.initialSort );
      if( self.initialFilter ) collection = collection.filter( self.initialFilter );

      // Make the dgrid widget.
      self.listWidget = new ListConstructor( { collection: collection });

      // Place the grid, invisible, in the right node, start it up, and
      // make it invisible
      domConstruct.place( self.listWidget.domNode, self.listWidgetNode );
      self.listWidget.startup();
      domStyle.set( self.listWidget.domNode, { display: 'none' } );
       
      self.own( 

        self.listWidget.on("dgrid-select", function( e ) {
          var rowId = e.rows[0].id;
          self.set( 'value', rowId );
        }),

        // Reload ON can ne triggered by a click, or by a refreshData
        on( self.domNode, 'overlayClick', function( e ){
          self.set( 'overlayStatus', { overlayed: false, clickable: true } ); // CLICKME OFF
          self.set( 'overlayStatus', { overlayed: true, clickable: false } ); // LOADING ON
          self.listWidget.refresh();
        }),
        topic.subscribe('refreshData', function( ){
          if( self.immediateRefresh ){
            self.set( 'overlayStatus', { overlayed: true, clickable: false } ); // LOADING ON
            self.listWidget.refresh();
          } else {
            self.set( 'overlayStatus', { overlayed: true, clickable: true } ); // CLICKME ON
            collapseList();    
          }
        }), 

        // Reload OFF can be triggered by a refresh-complete or by a dgrid error
        on( self.listWidget.domNode, 'dgrid-refresh-complete', function( e ){
           self.set( 'overlayStatus', { overlayed: false, clickable: false } ); // LOADING OFF
           self.set( 'value', self.value );
        }),
        on( self.listWidget.domNode, 'dgrid-error', function( e ){
           self.set( 'overlayStatus', { overlayed: false, clickable: false } ); // LOADING OFF
           self.set( 'overlayStatus', { overlayed: true, clickable: true } ); // CLICKME ON
          topic.publish( 'globalAlert', 'Error: ' + e.error.message, 5000 );
          collapseList();    
        }),
 
        // Escape pressed at body level: close the select box, select
        // value that selected in the first place when it was open
        //on( document.body, 'keydown', function( e ) {
        on( self.listWidget.domNode, 'keydown', function( e ) {
          if( e.keyCode == 27 && self.expanded){
            e.stopPropagation();
            domStyle.set( self.listWidget.domNode, { display: 'none' } );
            self.expanded = false;
            self.listWidget.clearSelection();
            self.listWidget.select( self.valueWhenOpen );
          }
        }),


        // Open or close when pressing enter
        on( self.domNode, 'keydown', function( e ){
          if( e.keyCode == 13 ){
            if( ! self.expanded  ){
              expandList();
            } else {
              collapseList( self.row( e ) );
            }
          }
        }),

        // Open or close when rlicking on it with mouse
        on( self.domNode, 'click', function( e ){
         // self.listWidget.refresh();
          if( ! self.expanded ){ 
            expandList();
          } else {
            collapseList( self.row( e ) );
         }
        }),



        // Focus out: hide the select box
        // FIXME: Haven't quite managed this one yet
        on( document.body, 'click', function( e ) {
          if( self.expanded){
          //  domStyle.set( self.listWidget.domNode, { display: 'none' } );
          //  self.expanded = false;
          }
        }),

        // If there is a change and store is queryEngine-less and has sorting/filtering, will need to refresh
        self.store.on( 'add,update,delete', function( event ){

          if( ! self.store.queryEngine && self.listWidget._renderedCollection.queryLog.length ) {
          
            // Zap partialResults, so that Observable doesn't actually work
            self.listWidget._renderedCollection._partialResults = null;

            // Refresh the data
            self.listWidget.refresh( { keepScrollPosition: true } );
          }
        }),

        // If the element currently selected is changed, need to re-render
        // the labelNode to reflect the changes.
        // Ditto for deletions.
        self.store.on( 'update', function( event ){
          if( event.target[ self.store.idProperty ] == self.value ){
            self.labelNode.innerHTML = '';
            put( self.labelNode, self.renderRow( event.target ) );
          }
        }),
        self.store.on( 'delete', function( event ){
          if( event.target[ self.store.idProperty ] == self.value ){
            self.labelNode.innerHTML = 'Item deleted';
          }
        })

      );

      // Function to expand the widget to include the select list.
      // It will do all of the required operations: make it visible in the CSS,
      // give the focus to the right element, mark it as "expanded", and move it
      // if necessary to do so (e.g. its bottom is out of the visible screen)
      function expandList(){
        self.valueWhenOpen = self.value;
        domStyle.set( self.listWidget.domNode, { display: 'block' } );
        if( typeof( self.value ) !== 'undefined' && self.value !== null ){
          var r = self.row( self.value );
          self.listWidget.focus( r );
        }
        self.expanded = true;
        self._moveIfNecessary();
      }

      // Function to collapse the widget so that the select list is no longe there.
      // It will just make it invisible, but it will also set the widget value to
      // the row element. This is to be called once a pick is successful, either
      // with an Enter or with a mouse click.
      function collapseList( row ){

        domStyle.set( self.listWidget.domNode, { display: 'none' } );
        self.expanded = false;
        if( row ){ 
          self.set( 'value', row.id);
        }
      }

    },

    // Te dgrid might grow to the point that its bottom is outside of the
    // actual visible area. This would be bad (the bottom elements would be
    // unreachable). So, it calculates things up and makes sure that the dgrid
    // is moved up, also considering the required self.distanceFromBottom
    _moveIfNecessary: function(){
      var self = this;

      //self.listWidget.resize();
      domStyle.set( self.listWidget.domNode, { top: '' } );
      var bodyBox = domGeometry.getContentBox( document.body );
      var listBox = domGeometry.position( self.listWidget.domNode, true );
      var delta = bodyBox.h - ( listBox.y + listBox.h ) - self.distanceFromBottom;
      if( delta < 0 ){
        domStyle.set( self.listWidget.domNode, { top: (delta)+'px' } );
      } else {
        domStyle.set( self.listWidget.domNode, { top: '' } );
      }


    },

  });
 

});


