define([

  "dojo/_base/declare"
, "dojo/_base/lang"

, "dojo/topic"

], function(

  declare
, lang

, topic

){

  return  declare(null, {

    templatedHooks: true,

    constructor: function(){
      this.templatedHooks = true;
      topic.publish('hotplate/hotClientDojo/hooks/constructor/' + this.id, this);
    },

    buildRendering: function(){
      topic.publish('hotplate/hotClientDojo/hooks/buildRendering/before/' + this.id, this);
      this.inherited(arguments);
      topic.publish('hotplate/hotClientDojo/hooks/buildRendering/after/' + this.id, this);
    },

    destroyRendering: function(){
      topic.publish('hotplate/hotClientDojo/hooks/destroyRendering/before/' + this.id, this);
      this.inherited(arguments);
      topic.publish('hotplate/hotClientDojo/hooks/destroyRendering/after/' + this.id, this);
    },

    postCreate: function(){
      topic.publish('hotplate/hotClientDojo/hooks/postCreate/before/' + this.id, this);
      this.inherited(arguments);
      topic.publish('hotplate/hotClientDojo/hooks/postCreate/after/' + this.id, this);
    },

    startup: function(){
      topic.publish('hotplate/hotClientDojo/hooks/startup/before/' + this.id, this);
      this.inherited(arguments);
      topic.publish('hotplate/hotClientDojo/hooks/startup/after/' + this.id, this);

    },

    destroy: function(){
      topic.publish('hotplate/hotClientDojo/hooks/destroy/before/' + this.id, this);
      this.inherited(arguments);
      topic.publish('hotplate/hotClientDojo/hooks/destroy/after/' + this.id, this);
    }

  });
});

