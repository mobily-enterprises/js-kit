
define([
  'dojo/_base/declare', 
  'dojo/dom-attr',
  'dojo/text!./templates/SearchPage.html',
  'dojo/store/Memory',
  'dojo/store/JsonRest',
  'dojo/store/Observable',
  'dojo/Stateful',

  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',

  ], function(
  declare
  , domAttr
  , content
  , Memory
  , JsonRest
  , Observable
  , Stateful

  , _WidgetBase
  , _TemplatedMixin

){

  return declare([_WidgetBase, _TemplatedMixin], {
    templateString : content,

    postCreate:function(){

    }

  });


});
       
