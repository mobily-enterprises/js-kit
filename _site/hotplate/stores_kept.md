JSON REST STORES


# NOTE

This file has a mixture of old information about Dojo stores (I now use dstores), and some notes about observability.

Some of this writeup is good -- will leave it here and will finish it once dstores allow to have cached, observable Rest stores which actually work without refreshing.


OTHER NOTES:

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


  -------------------------------------------------------------------




KNOTS:
* Can PUT know if an item was created or overwritten? It does make a difference when talking about REST stores
* 

# Stores

Stores are objects that can store values, retrieve values, and retrieve collection of values based on a query.
There are effectively two types of stores:
 * Local stores (often memory)
 * Remote stores (often REST-based)
Local stores obviously have access to all of the local data, whereas remote stores don't. The implications of this are far-fetching and need to be deal with --especially when you make a store "observable" (that is, you want query results to be notified of changes). 

# Anatomy of a store

A store in simple term is an object with the following methods:

* `store.get( id )` -- fetch the item with id `id`
* `store.put( object, options )` -- store the object, which will have a unique id
* `store.remove( id  )` -- remove the item with id `id`
* `store.query( conditions, options )` -- return a collection of items satisfying `conditions`
* `store.getIdentity( )` -- returns the property acting as "id"

A store also has the following properties:

* `store.idProperty` -- the property treated as "id", for `get()` and `put()` operations

## The memory store

A memory-based story is a simple implementation of these methods manipulating a hash. The slightly complex part is in the querying, where items need to be returned based on the conditions set in `conditions`.

## The REST store

A REST store is initialised specifying a target, for example `var s = new JsonRest( { target: 'http://exmaple.com/users'} )`. Whenever an operation is executed, a network request is executed to complete that operation. For example, `get` will trigger an HTTP GET request, and so on.

# Caching stores

A common scenario while using stores is using a memory store as the cache of a REST store. The can be done by creating a "super-object" that implements all of the methods mentioned above, but then:

* `store.put()` will run the `put()` call on the main store, and then -- if successful -- will also write it onto the cache store
* `store.get( id )` will check if `id` is already present in the cache store -- if so, the main store won't be queried, and the cached result will be returned instead
* `store.query()` will always query the main store, but then each item will then be saved onto the cache.

The `store.query()` method may also be used to query cached stores if your application can make reliable assumptions that the remote data hasn't changed.

# Observing local stores

Observing stores should read as "Observing queries". When a store is observable, it has its `query()` method overridden, so that:

* A `notify( object, existingId )` method is added to the store. This method is used to notify a store that an element has changed.
* The original query is overridden, so that a an `observe( object, existingId )` method is added to the resultset. Note that "_to the resultset_". This means that `observe()` will ideally be called whenever an item is changed, _and that change affects that specific resultset_. To clarify: is you run `results = query( { active: true } )`, and then you decide to run `results.observe( function action(){ ... }` (which means `action()` will be called when the resultset is affected), and then call `notify( { name: 'Tony', active: false, id: 10 }, 10 ), the observing `action()` function should _not_ be called, since the change doesn't affect that specific changeset.
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

With remote stores, you don't have this luxury.

# Observing remote stores

Observing remote stores is a completely different story -- and a much harder one to grok. There are two sides to this story:

* You need to be notified that the store has actually changed. Problem: you cannot just overload `put()`, because changes are happening outside your application. The server needs to do the hard work.
* You need to check if a resultset is affected. Problem: you do NOT have access to your dataset

## Getting notifications

By reading this document, it's clear that all you need to do is tell your stores that an item has changed by using the `notify()` method. So, the solution to this issue is seemingly simple: you just have make sure the server communicates to the client, via polling or via pushing (comet, etc), making sure that the server tells the client the important parts (what changed, and how it changed) so that the client can run the proper `notify()` call on its stores.

## Network considerations on messages

It seems simple, until you land this to a real use-case. Imagine you have a system with 100,000 users, and about 5000 of them are logged in at the same time. Each open tab from each user will be "registered" on the server, and will receive messages (via push or pull, it doesn't really matter) about store contents that changes. Ideally if a user updates their profile picture, other users will instantaneously get the new picture displayed (web 2.0 at its best!). However, you can see how this will quickly become a problem -- a network load problem.
Basically, you will need to make sure you don't flood your network with messages. A possible way to fix this problem is by creating sub-federations of "workspaces" (which are the stem for multi-homing environment).
So, when a browser tab registers itself, it's always associated with a user. Each record can have a userId and a workspaceId, and each user can belong to several workspaces.
There are different cases when a record is updated:

* There is no workspaceId nor userId fields. In this case, the change will be broadcast to all tabs.

* There is a workspaceId (userId might be there or not). In this case, the change will be broadcast to all  tabs owned by users who belong to that specific workspaceId

* There is only a userId, no workspaceId. In this case, the change will get broadcast to all tabs owned by users who are in any one of the workspaceIds the userId also belongs to. This is the most expensive case: for example, if Tony Mobily changes his profile picture, he is potentially being displayed by users in any one of the workspaces he belongs to. So, all users who share at least one workspace will receive the notification.

Even though it's still a potentially expensive operation, it's still much better than broadcasting every single change to every single user.

Note that I haven't even considered possible ramifications in terms of access control (for example, there might be a contact marked as "private", for which only selected users should be notified).

This is to say that server-side notifications are easy in theory, but hard beasts in practice.


*****




* In a REST store, you do not have access to _all_ of the data. This means that when running `put()`, you don't really know where data will be placed.

* When you run a `put()` request, you don't know how the query affects placement



Checking resultsets for REST stores is really complex. After a `store.notify()`, the `queryUpdater()` function (which is run over the resultset) needs to work out if the resultset has changed, and -- more importantly -- where the new record will be placed.
If it's a `put( { ... }, { before: 14 } )`, the server will be instructed to place the item before the record with id `14` (for example, if you just moved an element using drag&drop). The store, assuming that no `sort` is set, should call the query listeners telling them about the move. However, if `before` isn't specified, and `sort` is, the record will need to end up in the right spot -- and this can only be done in cases where the `queryUpdater()` has not only full access to the data, but also access to the very functions that are used to query and sort the existing data. This is simply not possible with REST stores.
On the other hand, issuing a `refresh()` (that is, re-running the query) after each operation is both an overkill (it loads the server unnecessarily) and is visually ugly.
Here is a breakdown of the possible calls:

* `store.remove()`. This is the easy case: if an item is removed, then it will need to disappear from the resultset. This is always true. So, the `queryUpdater()` will look for that item in the resultset, and -- if found -- will call the listener like so: `listener( object, position , null )`, where `position` is where the item was in the resultset. Easy.

* `store.put()` This is not as easy nor straightforward as a `remove()`: does the new item satisfy the search conditions dictated by the query options? What about the sorting options? Where should the item be placed? These are all questions that could possibly be answered if you had access to the store's data and the filtering/sorting functions. Unfortunately, with REST stores you don't have access to either one of them.

So, `put()` is the tough one to consider. 

Assume for a second that you have an observable, REST store that uses the memory store for caching. This is the most common situation. Also, imagine that you are getting server messages so that you are running the right `notify()` for your stores -- when a message arrives, you make sure that you update the stores' cache and then issue tie right `notify()`. So, basically, you have an updated copy of your store's data in your store's cache.

In that case, you _could_ (in theory) use the cache store to find out where an item would belong after a query. Why "in theory"? Because in practice this often fails. Or, it only works when the sorting and filtering functions used on the client are completely equivalent to the ones used on the server. What about:

* Uppercase/lowercase issues (MongoDb's searches and sorting are case-sensitive, MySQL are case-insensitive)
* Specific filters (when filtering with `?name=tony` in the URL, the server might return records where the field `name` _contains_ `tony`, and so on)
* Custom filters. You could specify a search field, server-side, called `everywhere` so that passing `?anywhere=something` will search for `something` in a bunch of different fields. This might be the case in an application where you have the contacts view, and want to be able to filter data just by typing in a textbox.

And, all this is assuming that your application uses messages correctly, making sure that the store's cache is fully in sync with the server's. If your application doesn't use server messages/Comet, you would be applying the Memory store's sort and filtering functions on _partial_ data. Recipe for disaster.

You _can_ decide to write a memory store that suits your DB server, and mimics all of the server's searching abilities. However, this would be potentially a monumental amount of work. 

So:

* When using a REST store, you don't have access to all of the data, so the `queryUpdater()` cannot reliably work
* Even if you sync your data with pulled messages or Comet, you would need to make sure that the local store has the exact same filtering functions as the server's. Something you cannot really trust.

### A possible solution about checking REST resultsets

The "solution" is based on the following principles:

* You can decide in some simple queries (especially for simple searching and sorting), to trust the caching store's queryEngine. For example, to filter out by a simple boolean field (e.g. `(active == false)`). This should be the default behaviour. The same applies to the `before` value: assuming that the memory store does comply with the natural ordering using `before`, the right position will be returned.
* You can decide, on a per-query basis, the position of an item as "first" or "last" in case the item is not found in the resultset. This is ideal if you know that you are not applying any filtering or you know _in advance_ where the item will be placed in the database
* You can specify, in `put()`, if an edited element should be left in place in case the item is found in the resultset. This, again, should be used when you _know_ that editing a record will not change its "eligibility" in terms of being in the store.
* In all other cases, a notify() should be fired to tell widgets that "something has changed, the change is not reliably tracked, and a refresh should happen"

There are two main issues with forcing the refresh:

* It's expensive. It means that for each `put()`, you also need to run a query on the server. Plus, the client will have to wait for the data to arrive in order to have a "working" widget again

* It's not part of `notify()` protocol. The listener is designed to be told where to place, move, or delete an element; it's not really designed to say "I don't really know". Basically, listeners cannot be told right now "something needs to change, but I don't know what it is".


















There needs to be a solution to the "REST" problem -- something that goes beyond the "implement the same filtering and sorting functions on the client", especially since you don't want to change the client implementation if you change, for example, database server; and you don't want to implement complex search functions based on arrays for more evolved search functions (if that's even possible).

How can `queryUpdater()` know what to do? The answer is, 

"**it doesn't, it can't, it won't, it shouldn't, it mustn't**"



It all seems negative, but it's not so bad.

The solution comes from the following:

* You should be able to tell a store where to place new items (where "new" means "not in the resultset", rather than "new elements in the database") regardless of filtering/sorting/etc. at query level (that is, passing a `placeNew` parameter).

* When `placeNew` is not defined, you should only get notification where there is no filtering/sorting/etc. _and_ `before` is specified (since the records are displayed in organic order).

Basically, if you have:

* `placeNew` as a query option (as `first` or `last`), and `before` as a `put()` method option (as well as the usual `query`, `start`, `count` and `sort`)
* `filteringOn` as a flag set to true if `query`, `sort`, `start` or `count` is defined 
    
A refresh will always be necessary, and therefore no listener will be called, if:

  !placeNew && ( filteringOn || !before )

So:

"The query listener is only fired with modifications when either `placeNew` is defined in the query, or when the store is free from filters _and_ `before` is specified (natural ordering)."

This is consistent with the store effectively, explicitely knowing where to place the item.

NOTE: as far as the DB server is concerned, if `before` isn't set, a new item being `put()` will be placed anywhere in the collection --  even when the collection supports natural ordering (that is, it will honour `before` when passed). So, it is possible that a `put()` that doesn't specify `before` will result in an item being placed either to the beginning, or to the end (assuming that the DB server is smart enough not to place `before`-less items in the middle of a narually ordered collection). So, when using `placeNew` and using `put()` without specifying `before`, you need to make sure that the implementation of your DB server is consistent to what you are showing in the interface. In short,

"In case `before` not passed, and the collection supports natural ordering, developers should specify `placeNew` in their queries, but need to make sure that the backend places `before`-less items in the same manner (first or last) defined in `placeNew`"

# Creating stores client side, or "interpreting notifications"

There is another potential issue to consider: creating objects representing stores.
On the server side, you are likely to have one store object per store, each one responding to a specific URL. 

Take for example: `/workspaces/:workspaceId/users/:userId/categories`. On the server side, you would have:

* GET `/workspaces/:workspaceId/users/:userId/categories/` -> `query( {} )`) -- to return an array of categories, aft
* DELETE `/workspaces/:workspaceId/users/:userId/categories/:id` ->  `remove( :id)` -- to remove an element
* PUT `/workspaces/:workspaceId/users/:userId/categories/:id` ->  `put( object )` -- (where `object` has an id) to overwrite or create an element
* POST `/workspaces/:workspaceId/users/:userId/categories/` ->  `put( object )` -- (where `object` does NOT have an id) to add a new element

The server knows that requests will come for those URLs, and respond accordingly.

The client side is a little more complicated than that. In your application, you will need to create a different store for each URL (the constructor for the store object includes a `target` for a reason: the store needs to know what URL it should use to contact the server).

If you have two widgets displaying data from the same source, you might end up with two different stores. For example, `var categories1 = new ObservableRestCachedStore( { target: '/workspaces/11/users/12/categories/`})` to display categories belonging to user `12`, and `var categories2 = new ObservableRestCachedStore( { target: '/workspaces/11/users/24/categories/`}) to display categories belonging to user `24`.

When a server issues a change in the record `{ store: 'categories', record: { id: 100, workspaceId: 11, userId: 12, categoryName: 'New name' }` for the store `categories`, it needs to:

1 Find all of the stores instances of `categories`. This is achievable if you have a list of stores in your application saved up by store name.
2 Find all stores where the URL parameters actually match. This is something easily oversighted -- and crucial. For example, in this specific case it wouldn't make sense to issue a notify for `categories2`, because it refers to the dataset matching `workspaceId -> 11` and `userId -> 24`, whereas the notification was for a category belonging to `userId -> 12`.

The second point is the crucual one: assuming that the URL will apply id-field filtering (which is the only sane way I can think of), if you don't apply the second step, the store `category2` will get polluted with data that doesn't belong to it, and never will.

Basically, receiving notification from the server via messages (using pull, Comet, etc.) is only a beginning. The client needs to be smart about the stores it actually notifies, to avoid polluting stores.

## Even more tangling up: the "double name" issue

There is more to this problem, which makes it even more interesting. While developing your application, at some point you will need stores which refer to the same database table on the server. A practical example of this is the table `workspacesUsers`, which is a list of users "connected" to a database. It's a simple "link" table, with only two fields: `{ workspaceId: id, userId: id }`.
You have your stores, created as `workspacesUsers1 = new ObservableRestCachedStore( { target: '/workspaces/:workspaceId/users/'})` which is all fine. One day, you discover that you also want to list the workspaces a user is linked to. So, you want to do `usersWorkspaces1 = new ObservableRestCachedStore( { target: '/users/:userId/workspaces/'})`. The problem you have at this point is that on the server you have two different stores, but they are referring to the same database table. If one changes, the other one changes too.
You have two options:

* You make sure the server knows which stores are "siblings", and issues _two_ messages when data changes. This is the "simple" approach, with two problems: 1) More network traffic 2) More importantly, the client will only ever know that a sibling store has changed from a server message 3) The server needs to be programmed so that while it doesn't broadcast a change to the same user who has originated it, it will need to do so in case the message is for a sibling store.

* You make sure the client knows which stores are "siblings". This means that when there is a message for `usersWorkspaces`, the client will need to update the cache, and run the `notify()`, for both stores.









