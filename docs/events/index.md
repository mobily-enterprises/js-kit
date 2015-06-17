---
layout: page
---

# Events definitions

Several hotplate modules emit and receive events. Normally, an event in Node.js is "fire and forget". In Hotplate, events actually fire a callback. This implies that:

* each listener to the event needs to know exactly how many parameters are passed (the last one is the callback)
* each emitter needs to call an event with the right parameters

Here are the events fired in Hotplate.

## stores

### Input

None

### Return

An associative array where each key is the store name. It's important that the module names are unique throughout your application.

### Example

    hotplate.hotEvents.onCollect( 'stores', 'hotCoreAuth', hotplate.cachable( function( done ){

      var stores = {}

      var AuthStrategies = declare( JsonRestStores, JsonRestStores.HTTPMixin, {

        schema: new SimpleSchema({
          id:        { type: 'blob', isRequired: true, trim: 30 }  ,
        }),

        handleGet: true,
        handleGetQuery: true,

        storeName:  'authStrategies',

        publicURL: '/authstrategies/:id',
        hotExpose: true,

        implementFetchOne: function( request, cb ){
          // ...
          cb( null, doc );
        },

        implementQuery: function( request, cb ){
          // ...
          cb( null, docs );
        },
      });
      stores.authStrategies = new AuthStrategies();

      done( null, stores );
    }))



