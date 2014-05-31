# Observable, cached Json REST stores: a detailed overview

A very common case, in Dojo, is having a REST store which uses a Memory store as its cache, and then have the resulting store as "observable". 

This use case for stores is both common and complex. It's even more complex when you want to have these stores updated by a remote message (via Comet, or polling the server for changes).

In this article I will try and cover all of the ground regarding these stores.

## A store

A store is an object with the following methods:

* `store.get( id )` -- fetch the item with id `id`
* `store.put( object, options )` -- store the object, which will have a unique id. In `options`, you can have:
  * `overwrite`. If set to `true`, it will force the object to pre-exist. If set to `false`, it will force the object to be a new one. If unset, it won't matter whether an object existed or not.
  * `before`. If set, it will define where to place the object in case of "natural ordering" (that is, no sorting field is specified when querying the object).
  * `id`. It's the object's id, although it's normally also specified in the object itself.
  * `parent`. It specifies the  a "parent" object for hierarchical stores  
* `store.add( object, options )` -- it's the same as `store.put()` but with `overwrite` set to `true`.
* `store.remove( id  )` -- remove the item with id `id`
* `store.query( query, options )` -- return a collection of items satisfying `query`. `query` is an object specifying the filter. Options can be:
  * `start`: starting offset
  * `count`: how many objects to return
  * `sort`: what to sort by, in the format: `[{attribute:"price, descending: true}]`
* `store.getIdentity( )` -- returns the property acting as "id"

A store also has the following properties:

* `store.idProperty` -- the property treated as "id", for `get()` and `put()` operations

This simple interface is what define a "store". 

### The Memory.js store

The memory store, [implemented here](https://github.com/SitePen/dstore/blob/master/Memory.js), is an implementation of the store interface I just described.
It also provides a `setData` method that will fill the store's `data` attribute (an array).

The current implementation of Memory.js doesn't take into account `before` nor `parent`. 

### The JsonRest.js store

The REST store, [implemented here](https://github.com/SitePen/dstore/blob/master/Rest.js), is am implementation of the store interface above, with a twist: it doesn't store data locally; instead, it fetches it via HTTP. This means that each REST store will have a `target` property; for example, if `target` is `/store/`:

* `store.query( {})` -> `GET /store` 
* `store.get( 10 )` -> `GET /store/10`
* `store.put( { name: 'Tony' } )` -> `POST /store/`
* `store.add( { name: 'Tony' } )` -> `POST /store/`
* `store.put( { name: 'Tony', 'id': 10 })` => `POST /store/10` (with object as JSON payload for request)
* `store.remove( 10 )` -> `DELETE /store/10`

The current implementation of Rest.js doesn't take into account `before` not `parent`, just like Memory.js. `overwrite` is done by passing `If-None-Match` or `If-Match` accordingly.

### A word on natural ordering and Dojo

Natural ordering is the order elements should be returned if no sorting option was passed. In terms of software development, natural ordering is what you get when, for example, you have a bunch of records and you want the user to decide where to place those records with Drag&Drop.

The idea of natural ordering is that `its implementation should be transparent`: if you pass `before` to a Memory store, it should place the added element in the right spot in `data` so that when you query the Memory store, it will return the data in the order you expect. If you pass `before` to a REST store, it should pass an ID in a header like `X-before`, so that the remote store knows where to place it "naturally" -- which, in DBMS terms, will probably mean that a sorting field will be added to the table, and that the DB will make sure that items come out in the right order when they are sorted by that sortinf field (for example, a field called `position`). Again, _this should be transparent_ and implemented _by the server_.

Unfortunately, neither Memory.js nor Rest.js in Dojo right now support `before`. This means that it's difficult "at best" to have working ["reordering" drag&drop in a dgrid using REST](see http://stackoverflow.com/questions/14796968/how-to-implement-row-reordering-with-dnd-in-dgrid); and it's really hard to make it work even with Memory.js (see [this](https://github.com/SitePen/dgrid/blob/master/test/data/base.js#L292) which then requires [this](https://github.com/SitePen/dgrid/blob/master/test/extensions/DnD.html#L84) -- hadrly "natural" ordering and way too much work).

# Caching stores

A common scenario while using stores is using a memory store as the cache of a REST store. The can be done by creating a "super-object" that implements all of the methods mentioned above, but then:

* `store.put()` will run the `put()` call on the main store, and then -- if successful -- will also write it onto the cache store
* `store.get( id )` will check if `id` is already present in the cache store -- if so, the main store won't be queried, and the cached result will be returned instead
* `store.query()` will always query the main store, but then each item will then be saved onto the cache.

Note that `store.query()` always queries the main store; there are cases where you actually do want to query the cache store instead for example, you might decide to run the `query()` on the original store first (to fill up the cache), and then `query()` the cache store from then on. Or, you might decide to run `setData` to the cache store manually, and then `query()` the cache store from then on.

Dojo doesn't allow this at the moment.

## Observable stores

Observing stores should read as "Observing queries". When a store is observable, it has its `query()` method overridden, so that:

* A `notify( object, existingId )` method is added to the store. This method is used to notify a store that an element has changed.
* The original query is overridden, so that a an `observe( object, existingId )` method is added to the resultset. Note that "_to the resultset_". This means that `observe()` will ideally be called whenever an item is changed, _and that change affects that specific resultset_. To clarify: if you run `results = query( { active: true } )`, and then you decide to run `results.observe( function listener(){ ... }` (which means `listener()` will be called when the resultset is affected), and then call `notify( { name: 'Tony', active: false, id: 10 }, 10 )`, (note that `active: false`), the `listener()` function should _not_ be called, since the change doesn't affect that specific changeset in any way.
 * `put()`, `remove()`, which are methods that change the store's contents, are overloaded so that `notify()` is called once the operations are successful.

So, assume that you run 

    results = query( { active: true } )
    results.observe( function listener1(){ ... }
    results.observe( function listener2(){ ... }

At this point you have a query and two listeners, `listener1()` and `listener2()`, which are to be triggered when `results` is affected.
If you run:

    store.put( { name: 'Tony', active: false, id: 10 })
    -> (called by `store.put()`) store.notify( { name: 'Tony', active: false, id: 10 })` 

This will run the store's internal `queryUpdater()` for that particular resultset will run, and will check if the `put()` affects this resultset. Since the resultset filters any record that is marked as `active`, and the record added is `{ active: false }`, nothing will happen.
However, if you run:

    store.put( { name: 'Chiara', active: false, id: 10 })
    -> (called by `store.put()`) store.notify( { name: 'Chiara', active: true, id: 11 })` 

Then the store's internal `queryUpdater()` for that particular resultset will run, and will find that the result is _indeed_ in there. At this point, both `listener1()` and `listener2()` will be called.

The `queryUpdater()` needs to be smart enough to tell `listener1()` and `listener2()` what happened. The signature for the listeners is this:

    listener(object, removedFrom, insertedInto);

In this case, it might call something like:

    listener1( { name: 'Chiara', active: true, id: 11 }, null, 5)

That `5` at the end is the spot where the item will be added. This is when, magically, the item appears in your web interface.

You can clearly see that the `queryUpdater()` absolutely must have access to the _full_ store data to figure out where an item will be placed. For example, if the query includes `sort()`ing options, and an item that satisfies the filters is added to the store via `put()`, the `queryUpdater()` will need to call the listeners specifying the exact spot in the query where the item will be. This can only possibly happen with full access to the data -- and, full access to the store's functions to filter and search this data.

With remote stores, the only access to "local" data you have is the data you have in the caching store.

## Some interesting issues mixing REST and Memory stores

Dojo's Memory store provides some really basic filtering and ordering options: in terms of filtering, you can pass a regular expression or an exact match; and for sorting, you can define a set of fields to filter by. This is definitely not bad for a simple memory-based database. However, when dealing with real application, a REST store is likely to provide much more in terms of filtering:

* It might specify that some fields need to be exact matches, and some others can just be partial ones. This needs to be defined at server level
* It might specify a special `globalSearch` searching field which searches several fields in the store
* It might be either case sensitive (like Mongo), or case insensitive (like MySQL) by default 

These possible differences become evident when using Observable, mainly because you are using the Memory store's ability to sort and filter, assuming that the remote store will follow the same filtering and sorting patterns (which might not).
To solve the problem you have two possible solutions:

* You can specify a queryEngine for each store, making sure that filtering options are absolutely identical
* You can make sure that you only ever allow the use of Memory's queryEngine when you know it will work (see: filtering one boolean value), and make sure the widget does a hard refresh in any other case

The second solution is obviously the only practicable one.



















## Placement in observable stores: a `put()` is a `put()`

An important issue in Dojo is that a `put()` operation is used both for changing an item, and for repositioning it.
If you have a `put()` with `before` set in its options, you know that the item needs to be repositioned, but cannot safely know that it hasn't changed _as well_.
If you are viewing a collection in a dgrid, and perform a simple drag&drop within the dgrid, it it will issue a `put()` with the right `before` set. However, you might perform a `put()` 


























"GENERAL PROBLEMS WITH STORES"

"Natural ordering"

* `put()` can have the option `before`. If it does, the item will be placed "before" another one. This is what is referred to "natural ordering", which should only be expected when no sorting option is specified. This is what developers would, and should, expect from `before`. Also, developers should expect that issuing `put()` on a Memory store and a REST store should place the element in the right spot (Assuming the REST store honours it)
  * PROBLEM: JsonRest.js at the moment doesn't pass `before` in a header. SOLUTION: Add `before` to the headers. For `null` (meaning "at the end" in Dojo store's terms), leave the header empty. Note: leaving headers empty is allowed by HTTP, but it's hard to achieve in Dojo
  * PROBLEM: Memory.js at the moment doesn't consider `before` -- and it should. SOLUTION: Memory should consider `before`, by placing items in this.data in the right spot. CODE: There is code that does just that here: https://github.com/mercmobily/hotplate/blob/master/node_modules/hotDojoStores/client/Memory.js I am happy to create a pull request against dstore if you feel it's OK.
  * PROBLEM: Observable right now takes `before` into consideration even if `sort` or `query` are specified. SOLUTION: make sure that `before` is only ever considered by Observable if `query` and `sort` are empty. This is true for any store, managed by JsonRest.js or Memory.js or anything else.

"Querying the cache is desired"

* A common configuration of stores is JsonRest.js using Memory.js as cache. This means that `get(id)` will check if the item is in the cache.
  * PROBLEM: `store.query()` always bypasses the caching store, and fires up the query to the main one. Sometimes, you want to fill the caching store up with data, and use the caching store when running `store.query()`. SOLUTION: Add an option to the query, something like `useCache`, which will allow `store.query()` to use the caching store. Also add a store-wide option, `useCacheInQueries`, which will make sure specific stores use the caching store every time it's queried


"PROBLEMS WITH REST STORES"

"Setting a default placement per query"

* In some cases, developers know in advance where to place an item in a specific spot _regardless_ of what filtering, paging and sorting is applied. This is true when a new record, like a comment, is added by the database in chronological order, and the developer knows in advance where it should be placed in the interface.
  * PROBLEM: There is no way to specify, by default, where to place an element _per query_ or _per put() operation_. SOLUTION: `defaultPlacement` should be a query parameter, and it should only be followed if the element is not found in the resultset. Right now, `defaultPlacement` is a store attribute, which is too broad: you might well have two different widgets using the same store, one applying specific sorting options (where placing last wouldn't make sense), and another one displaying items in their natural order (where placing last might make perfect sense). defaultPlacement being a store-wide variable mean that it will apply to both cases, which is not what you want.

Basically, the use-case I want to highlight is the following. Imagine you have a store called "workspacesUsers", where each record has a boolean `enabled` field, and that you only want to display fields where `enabled: true`. Imagine that you are using the same store for two different dgrids.

If you drag an item within the store itself (repositionihg it), you will `put()` it 

Calling the listener with a new signature is a significant API change. However, I cannot find another way to solve this common use case: You have two grids displaying data using the same store. Fields have a property, `enabled: true`, which means that they are active and should be displayed. I drag an item to the rubbish bin, which triggers a `put()` of the same field, with `enabled: false`. At this point, since there are sorting options, Observable.js should give up and call `listener(null, -1, -1)`.

If `notify(null, -1, -1)` didn't happen, and you wanted to do this "on your own", you could: you could trigger a regresh for the source widget. However, the **second** widget displaying the data won't get such a refresh, and will kep displaying the item.

## GOALS ACHIEVED WITH THESE CHANGES

* Natural ordering is followed when no sorting is specified, by Memory.js and (potentially) by REST stores (which get `before` via headers).
* Developers are free to query the cache directly if they want (and it if makes sense for their specific application)
* Remote stores are marked as such, and 


"COMET COMING"

Assume that you have three stores: 

  * `workspaces` (target: `/workspaces/`),
  * `workspacesUsers` (target: `/workspaces/:workspaceId/users/`)
  * `workspacesUsersInterests` (target: `/workspaces/:workspaceId/users/:userId/interests/`)

I will call this the "stores registry".
Also, consider that:

  * In your client application, you might create several instances of `workspacesUsersInterests`, each one with a different `userId` (for example, `/workspaces/10/users/11/interests/`), used in different widgets
  * In your client application, you might re-use the same store (meaning, with the exact same URL) for different widgets. This will make sure there is only one cache being kept, for example)

In such a scenario, the following is important:

  * You need to keep a list of stores you have, each one with the "unresolved" target (e.g. `{ workspacesUsers: { target: '/workspaces/:workspaceId/users/'} }`). I will call it the "registry".
  * When you want to use a store, you need to create an instance of it "resolving" the semicolon fields: `var workspacesUsers = stores( 'workspacesUsers', { workspaceId: 10 } )` will return a store with target `/workspaces/10/users/` (the unresolved URL is taken from the registry).
  * You need to be able to re-use stores, meaning that running `var workspacesUsers1 = stores( 'workspacesUsers', { workspaceId: 10 } )` and then `var workspacesUsers2 = stores( 'workspacesUsers', { workspaceId: 10 } )` should return the same store (that is, the first call creates it, the second call returns the same one from a cache), since the target resolves to the same URL. Note that calling `var workspacesUsers = stores( 'workspacesUsers', { workspaceId: 20 } )` (note the different 'workspaceId') will return a different store.
  * You needs to be able to fetch a list of all stores matching a store name (for example, `workspacesUsersAllStores = stores( 'workspacesUsers')` should return a hash like this: ` { '/workspaces/10/users/': dojoStoreObject, '/workspaces/11/users/': anotherDojoStoreObject }` (that is, the list of all stores created using `workspacesUsers`).

This is easily achieved with a "store factory" widget. A VERY BASIC, non-customisable factory is this: https://github.com/mercmobily/hotplate/blob/master/node_modules/hotDojoStores/client/stores.js However, a "real" one would need to be passed a store-creating function, and a store registry (rather than taking it from a global variable in the page, in this case `vars`).

Such a factory is crucial because when receiving a message from a remote server about an item being changed, you realistically get:

  * The store's name 
  * The object
  * The operation

If you have the `store()` function described above, when a remote server tells you about a change, you can:

  * use `store()` to get the list of actual store instances used in the application
  * check, for each instance, if the parameters fit the corresponding field in the object. Basically, you should be able to make the assumption that when fetching `/workspaces/11/users`, records from the collection will have the field `workspaceId` set to something. If the object coming in is `{ workspaceId: 10, userId: 1000, userName: 'Tony'}`, then it would be a mistake to notify an instance of `workspacesUsers` with target '`/workspaces/11/users` because that result has certaintly been filtered out. Note that this assumes that we can treat URL parameters as binding filters.
  * For each store instance where parameters correspond, fire a `notify()` (and, if present, also update the caching store -- it's presence can be checked by the `data` attribute).

If you don't have such a registry, you cannot reliably know what stores to notify in your application.






"Don't trust queryEngine"

* In a context of a JsonRest.js store cached by Memory.js, Observable.js uses Memory.js' `queryEngine` when trying to work out an element's placement. 
  * PROBLEM: The caching store might only have partial data (for example, if it was queried with `query` set); plus, the caching store's filtering/sorting mechanisms of Memory.js might differ to the ones in JsonRest.js (see: case sensitive vs. case insensitive, specific advanced filtering fields provided by REST store, for example, querying for `?globalSearch=`, etc.) SOLUTION: If the store is a remote one (`remote is true`), then only try to work out placement in the following case: **`defaultPlacement` is specified for the query, and the item isn't found.** Note: in case `defaultPlacement` is `first`, it will need to check that the range starts from 0; in case `defaultPlacement` is `last`, it will need to make sure that the current query is displaying the last record of the resultset. Otherwise, a `put()` on a store with `defaultPlacement` set to `last` will call the listeners so that they add a record at the bottom of every range observed in the dgrid.
